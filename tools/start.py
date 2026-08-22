#!/usr/bin/env python3
# tools/start.py

import argparse
import logging
import os
import pathlib
import subprocess
import sys
import traceback

BASE_DIRECTORY = pathlib.Path(__file__).resolve().absolute().parent.parent
LOG = logging.getLogger(__name__)
MONGODB_URL = "mongodb://database:27017"
MONGODB_PORT = 4000
WEB_PORT = 3000


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Start all website processes and services"
    )
    parser.add_argument("-b", "--build", action="store_true")
    parser.add_argument("-d", "--debug", action="store_true")
    return parser.parse_args()


def configure_logger(debug: bool = False):
    LOG.setLevel(logging.DEBUG if debug else logging.INFO)
    handler = logging.StreamHandler(sys.stdout)
    LOG.addHandler(handler)


def print_step(message: str):
    LOG.info(f"==== {message}")


def database_is_running() -> bool:
    if sys.platform == "linux":
        return NotImplemented
    elif sys.platform == "darwin":
        output = subprocess.check_output(["brew", "services", "list"])
        services = output.decode().splitlines()[1:]
        LOG.debug("\n".join(services))
        for service in services:
            name, status, *_ = service.split()
            if name == "mongodb-community@8.0" and status == "started":
                return True
        return False
    else:
        return NotImplemented


def start_database():
    print_step("Start database")
    if database_is_running():
        LOG.info("Database is already running")
        return
    LOG.info("Starting mongodb service")
    if sys.platform == "linux":
        raise NotImplementedError()
    elif sys.platform == "darwin":
        subprocess.check_call(
            ["brew", "services", "start", "mongodb/brew/mongodb-community@8.0"]
        )
    else:
        raise NotImplementedError()


def start_database_driver(
    build: bool = False, debug: bool = False
) -> subprocess.Popen:
    print_step("Start database driver")
    driver_path = BASE_DIRECTORY / "db"
    os.chdir(driver_path)
    if build:
        LOG.info("Building database driver")
        build_command = ["cargo", "build"]
        if not debug:
            build_command.append("--release")
        subprocess.check_call(build_command)
    LOG.info("Running database driver")
    binary = driver_path / "target" / ("debug" if debug else "release") / "db"
    run_command = [
        binary,
        "--port",
        str(MONGODB_PORT),
        "--mongodb-url",
        MONGODB_URL,
    ]
    if debug:
        run_command.append("--debug")
    return subprocess.Popen(run_command)


def start_webapp(build: bool = False, debug: bool = False) -> subprocess.Popen:
    print_step("Start webapp")
    os.environ.update(
        NODE_ENV="production", MONGODB_URL=MONGODB_URL, PORT=str(WEB_PORT)
    )
    if build:
        LOG.info("Installing NPM dependencies")
        subprocess.check_call(
            ["npm", "install", "--only=production"], env=os.environ
        )
        LOG.info("Building webapp")
        subprocess.check_call(["npm", "run", "build"], env=os.environ)
    LOG.info("Running webapp")
    return subprocess.Popen(["npm", "start"], env=os.environ)


def main():
    procs = []
    try:
        args = parse_args()
        configure_logger(debug=args.debug)
        # Check that the database is running
        start_database()
        # Start the database driver
        db_proc = start_database_driver(build=args.build, debug=args.debug)
        procs.append(db_proc)
        # Start the webapp process
        app_proc = start_webapp(build=args.build, debug=args.debug)
        procs.append(app_proc)
        # Wait for processes to complete
        for proc in procs:
            proc.wait()
    except KeyboardInterrupt:
        LOG.info("\nCtrl+C received, exiting")
        for proc in procs:
            proc.kill()
    except Exception:
        traceback.print_exc()
        for proc in procs:
            proc.kill()


if __name__ == "__main__":
    main()
