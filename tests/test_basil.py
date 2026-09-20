# tests/test_basil.py

import logging
import json

from bson.objectid import ObjectId

from tests import common

LOG = logging.getLogger(__name__)
USER_COUNT = 0


def get_email() -> str:
    global USER_COUNT
    email = f"test{USER_COUNT}@test.com"
    USER_COUNT += 1
    return email


###############################################################################
# Users
###############################################################################


def test_user_create():
    request = {
        "root": str(ObjectId()),
        "email": get_email(),
        "password": "foo",
        "device": "test-device",
    }
    response = common.post("user/create", request)
    assert response.status_code == 200

    body = response.json()
    LOG.debug(f"Response: {json.dumps(body, sort_keys=True, indent=2)}")
    common.assert_object_id(body["id"])
    common.assert_object_id(body["root"], expected=request["root"])
    assert request["email"] == body["email"]
    assert "token" in body


def test_user_create_no_root():
    request = {
        "email": get_email(),
        "password": "foo",
        "device": "test-device",
    }
    response = common.post("user/create", request)
    assert response.status_code == 200

    body = response.json()
    LOG.debug(f"Response: {json.dumps(body, sort_keys=True, indent=2)}")
    common.assert_object_id(body["id"])
    common.assert_object_id(body["root"])
    assert request["email"] == body["email"]
    assert "token" in body


def test_user_create_already_exists():
    request = {
        "root": str(ObjectId()),
        "email": get_email(),
        "password": "foo",
        "device": "test-device",
    }
    response = common.post("user/create", request)
    assert response.status_code == 200

    response = common.post("user/create", request)
    assert response.status_code == 400


def test_user_get():
    request = {
        "root": str(ObjectId()),
        "email": get_email(),
        "password": "foo",
        "device": "test-device",
    }
    response = common.post("user/create", request)
    assert response.status_code == 200

    user = response.json()
    user_id = user["id"]["$oid"]

    response = common.get(f"user/{user_id}")
    assert response.status_code == 200

    body = response.json()
    assert body["email"] == user["email"]
    assert body["root"] == user["root"]
    assert "recipes" in body
    assert "folders" in body
