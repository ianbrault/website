# tests/test_basil.py

import logging
import json
from typing import Optional

from bson.objectid import ObjectId

from tests import common

LOG = logging.getLogger(__name__)
USER_COUNT = 0


def get_email() -> str:
    global USER_COUNT
    email = f"test{USER_COUNT}@test.com"
    USER_COUNT += 1
    return email


def create_user(
    email: Optional[str] = None,
    root: Optional[str] = None,
    success: bool = True,
) -> tuple[dict, dict]:
    request = {
        "email": email if email is not None else get_email(),
        "password": "foo",
        "device": "test-device",
    }
    if root is not None:
        request["root"] = root
    response = common.post("user/create", request)
    if success:
        assert response.status_code == 200
        body = response.json()
        LOG.debug(f"Response: {json.dumps(body, sort_keys=True, indent=2)}")
        return request, body
    else:
        assert response.status_code == 400
        return request, {}


def get_user(user_id: str, success: bool = True) -> dict:
    response = common.get(f"user/{user_id}")
    if success:
        assert response.status_code == 200
        body = response.json()
        LOG.debug(f"Response: {json.dumps(body, sort_keys=True, indent=2)}")
        return body
    else:
        assert response.status_code == 400
        return {}


###############################################################################
# Users
###############################################################################


def test_user_create():
    request, response = create_user(root=str(ObjectId()))
    common.assert_object_id(response["id"])
    common.assert_object_id(response["root"], expected=request["root"])
    assert request["email"] == response["email"]
    assert "token" in response


def test_user_create_no_root():
    request, response = create_user()
    common.assert_object_id(response["id"])
    common.assert_object_id(response["root"])
    assert request["email"] == response["email"]
    assert "token" in response


def test_user_create_already_exists():
    email = get_email()
    create_user(email=email)
    create_user(email=email, success=False)


def test_user_get():
    _, user = create_user()
    response = get_user(user["id"]["$oid"])
    assert response["email"] == user["email"]
    assert response["root"] == user["root"]
    assert "recipes" in response
    assert "folders" in response


def test_user_get_non_existent():
    get_user(str(ObjectId()), success=False)


def test_user_delete():
    request, user = create_user()
    user_id = user["id"]["$oid"]
    email = request["email"]
    password = request["password"]

    request = {
        "email": email,
        "password": password,
    }
    response = common.post("user/delete", request)
    assert response.status_code == 200

    get_user(user_id, success=False)


# FIXME: add ping test


###############################################################################
# Folders
###############################################################################

# FIXME: ...


###############################################################################
# Recipes
###############################################################################

# FIXME: ...
