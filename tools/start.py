#!/usr/bin/env python3
# tools/start.py

import argparse
import logging
import os
import subprocess
import sys

from tools import common

LOG = logging.getLogger(__name__)
MONGODB_URL = "mongodb://127.0.0.1:27017"
DB_PORT = 4000
WEB_PORT = 3000


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Start all website processes and services"
    )
    parser.add_argument(
        "-b",
        "--build",
        action="store_true",
        help="Re-build database and webapp",
    )
    parser.add_argument(
        "-d", "--debug", action="store_true", help="Enable debug output"
    )
    return parser.parse_args()


def configure_logger(debug: bool = False):
    LOG.setLevel(logging.DEBUG if debug else logging.INFO)
    handler = logging.StreamHandler(sys.stdout)
    LOG.addHandler(handler)


def database_is_running() -> bool:
    if sys.platform == "linux":
        output = subprocess.check_output(
            ["sudo", "systemctl", "status", "mongod"]
        ).decode()
        LOG.debug(output)
        for line in output.splitlines():
            if "Active: active (running)" in line:
                return True
        return False
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
    LOG.info("Start database")
    if database_is_running():
        LOG.info("Database is already running")
        return
    LOG.info("Starting mongodb service")
    if sys.platform == "linux":
        subprocess.check_call(["sudo", "systemctl", "start", "mongod"])
    elif sys.platform == "darwin":
        subprocess.check_call(
            ["brew", "services", "start", "mongodb/brew/mongodb-community@8.0"]
        )
    else:
        raise NotImplementedError()


def start_database_driver(build: bool = False, debug: bool = False):
    LOG.info("Start database driver")
    common.start_database_driver(
        MONGODB_URL, DB_PORT, build=build, release=not debug, debug=debug
    )


def start_webapp(build: bool = False, debug: bool = False):
    LOG.info("Start webapp")
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
    common.open_process(["npm", "start"])


@common.script_wrapper
def main():
    args = parse_args()
    configure_logger(debug=args.debug)
    procs = []

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


if __name__ == "__main__":
    main()
