# tests/conftest.py

import logging
import os
import subprocess

import pytest

import tests.common as tests
import tools.common as tools

LOG = logging.getLogger(__name__)

DB_NAME = "basil-test"
MONGODB_URL = f"mongodb://127.0.0.1:27017"


@pytest.fixture(scope="session", autouse=True)
def database_fixture(request):
    is_debug = request.config.getoption("--log-cli-level") == "DEBUG"
    proc = tools.start_database_driver(
        MONGODB_URL,
        tests.Model.PORT,
        build=True,
        release=False,
        test=True,
        debug=is_debug,
    )
    LOG.info(f"Started database process {proc.pid}")
    yield proc

    # Returned from yield, clean up
    LOG.info("Tearing down")
    # Kill the database process
    proc.kill()
    # Drop the test database
    # Skip this if running in CI
    if os.getenv("CI"):
        return
    command = [
        "mongosh",
        "--eval",
        f'"use {DB_NAME}"',
        "--eval",
        '"db.dropDatabase()"',
    ]
    LOG.debug(f"Command: {' '.join(command)}")
    subprocess.check_call(command)
