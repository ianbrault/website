# tests/basil/test_folders.py

import datetime
from typing import Generator

import pytest

from tests.common import DateTime, Folder, User


@pytest.fixture(scope="module", autouse=True)
def folders_user() -> Generator[User, None, None]:
    user = User.create(email="folders@test.com")
    assert user is not None
    yield user

    # Delete the user to clean up
    user.delete()


###############################################################################
# Tests
###############################################################################


def test_folder_create(folders_user: User):
    folder = Folder.create(folders_user, "Test", folders_user.root)
    assert folder is not None

    dbfolder = Folder.get(folder.id)
    assert dbfolder is not None
    assert dbfolder.id == folder.id
    assert dbfolder.name == folder.name
    assert dbfolder.parent == folder.parent

    user = User.get(folders_user.id)
    assert user is not None
    assert folder.id in user.folders

    root = Folder.get(folders_user.root)
    assert root is not None
    assert folder.id in root.subfolders


def test_folder_modify(folders_user: User):
    folder = Folder.create(folders_user, "Foo", folders_user.root)
    assert folder is not None

    folder.modify(folders_user, "Bar")

    dbfolder = Folder.get(folder.id)
    assert dbfolder is not None
    assert dbfolder.name == "Bar"


def test_folder_modify_time_violation(folders_user: User):
    folder = Folder.create(folders_user, "Baz", folders_user.root)
    assert folder is not None
    folder.modify(folders_user, "Timestamped")

    timestamp = DateTime()
    timestamp.timestamp -= datetime.timedelta(hours=1)
    folder.modify(folders_user, "Error", timestamp=timestamp, success=False)


def test_folder_delete(folders_user: User):
    folder = Folder.create(folders_user, "Delete", folders_user.root)
    assert folder is not None
    folder.delete(folders_user)
    Folder.get(folder.id, success=False)
