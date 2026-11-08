# tools/common/__init__.py

import logging
import os
import pathlib
import subprocess
import time

LOG = logging.getLogger(__name__)


def project_directory() -> pathlib.Path:
    """
    Gets an absolute path to the project root directory.
    """
    if "PROJECT_DIRECTORY" in os.environ:
        return pathlib.Path(os.environ["PROJECT_DIRECTORY"])
    return pathlib.Path(__file__).resolve().absolute().parent.parent.parent


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
        poll_time: Seconds to wait before checking that the process has not exited

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
    process = subprocess.Popen(run_command)

    # Brief sleep then check that the process has not exited
    time.sleep(poll_time)
    status = process.poll()
    if status is not None:
        raise RuntimeError(f"Process {process.pid} exited with code {status}")

    return process
