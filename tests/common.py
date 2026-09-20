# tests/common.py

import logging
import json
import typing

import requests

LOG = logging.getLogger(__name__)

PORT = 44000


def build_url(url: str) -> str:
    return f"http://127.0.0.1:{PORT}/basil/v2/{url}"


def get(url: str) -> requests.Response:
    """
    Send a GET request to the test database server

    Args:
        url: URL string, appended to the base URL

    Returns:
        POST response
    """
    url = build_url(url)
    LOG.debug(f"GET: {url}")
    return requests.get(url)


def post(url: str, body: dict[str, typing.Any]) -> requests.Response:
    """
    Send a POST request to the test database server

    Args:
        url: URL string, appended to the base URL
        body: POST request body

    Returns:
        POST response
    """
    url = build_url(url)
    LOG.debug(f"POST: {url}")
    LOG.debug(f"POST: request: {json.dumps(body, sort_keys=True, indent=2)}")
    return requests.post(url, json=body)


def assert_object_id(oid: typing.Any, expected: typing.Optional[str] = None):
    """
    Assert that the given field from a POST response body is a BSON Object ID.

    Args:
        oid: Object ID, as taken from a POST response body
        expected: Expected Object ID match
    """
    # FIXME: check specific format of Object ID as well
    assert "$oid" in oid
    if expected is not None:
        assert oid["$oid"] == expected
