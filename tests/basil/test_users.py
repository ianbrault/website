# tests/basil/test_users.py

from bson.objectid import ObjectId

from tests.common import User

###############################################################################
# Tests
###############################################################################


def test_user_create():
    user = User.create(root=ObjectId())
    assert user is not None

    dbuser = User.get(user.id)
    assert dbuser is not None
    assert dbuser.id == user.id
    assert dbuser.email == user.email
    assert dbuser.root == user.root


def test_user_create_no_root():
    User.create()


def test_user_create_already_exists():
    email = User.generate_email()
    User.create(email=email)
    User.create(email=email, success=False)


def test_user_get_non_existent():
    User.get(ObjectId(), success=False)


def test_user_delete():
    user = User.create()
    assert user is not None
    user.delete()
    User.get(user.id, success=False)


# FIXME: add ping test
