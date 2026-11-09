# tools/common/__init__.py

import functools
import logging
import os
import pathlib
import subprocess
import sys
import time
import traceback
import typing

LOG = logging.getLogger(__name__)

REGISTERED_PROCESSES: list[subprocess.Popen] = []


def project_directory() -> pathlib.Path:
    """
    Gets an absolute path to the project root directory.
    """
    if "PROJECT_DIRECTORY" in os.environ:
        return pathlib.Path(os.environ["PROJECT_DIRECTORY"])
    return pathlib.Path(__file__).resolve().absolute().parent.parent.parent


def open_process(
    command: list[typing.Any], env: typing.Dict = os.environ.copy()
) -> subprocess.Popen:
    """ """
    args = [str(arg) for arg in command]
    LOG.debug(f"Opening process: {' '.join(args)}")
    process = subprocess.Popen(args, env=env)
    REGISTERED_PROCESSES.append(process)
    return process


def start_database_driver(
    mongodb_url: str,
    port: int,
    build: bool = False,
    release: bool = True,
    test: bool = False,
    debug: bool = False,
    poll_time: float = 1.0,
) -> subprocess.Popen:
    """
    Start the database driver process.

    Args:
        mongodb_url: Database connection URL
        port: Database server port
        build: Re-build the database driver
        release: Build/run the database driver in release mode
        test: Enable test compile-time feature
        debug: Enable debug output
        poll_time: Seconds to wait before checking that the process is active

    Returns:
        database driver process
    """
    driver_path = project_directory() / "db"
    os.chdir(driver_path)

    if build:
        LOG.info("Building database driver")
        build_command = ["cargo", "build"]
        if release:
            build_command.append("--release")
        if test:
            build_command.extend(["--features", "test"])
        LOG.debug(f"Build command: {' '.join(build_command)}")
        subprocess.check_call(build_command)

    LOG.info("Running database driver")
    binary = driver_path / "target" / ("release" if release else "debug") / "db"
    run_command = [
        str(binary),
        "--port",
        str(port),
        "--mongodb-url",
        mongodb_url,
    ]
    if debug:
        run_command.append("--debug")
    LOG.debug(f"Run command: {' '.join(run_command)}")
    process = open_process(run_command)

    # Brief sleep then check that the process has not exited
    time.sleep(poll_time)
    status = process.poll()
    if status is not None:
        raise RuntimeError(f"Process {process.pid} exited with code {status}")

    return process


def script_wrapper(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            result = func(*args, **kwargs)
        except KeyboardInterrupt:
            LOG.info("\nCtrl+C received, exiting")
            for proc in REGISTERED_PROCESSES:
                proc.kill()
            sys.exit(0)
        except Exception:
            traceback.print_exc()
            for proc in REGISTERED_PROCESSES:
                proc.kill()
            sys.exit(1)
        return result

    return wrapper
