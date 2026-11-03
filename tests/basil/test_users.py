# tests/basil/test_users.py

from tests.common import (
    Action,
    ActionType,
    Folder,
    ItemType,
    ObjectId,
    Recipe,
    User,
)


def verify_action(
    action: Action, item: ItemType, action_type: ActionType, id: ObjectId
):
    assert action.item == item
    assert action.action == action_type
    assert action.item_id == id


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


def test_user_authenticate():
    user = User.create()
    assert user is not None
    folder = Folder.create(user, "Foo", user.root)
    assert folder is not None
    recipe = Recipe.create(user, "Bar", user.root, [], [])
    assert recipe is not None

    auth_user, folders, recipes = User.authenticate(user.email, "foo")
    assert auth_user.id == user.id
    assert auth_user.root == user.root

    assert len(recipes) == 1
    assert recipes[0] == recipe

    root_found = False
    assert len(folders) == 2
    for auth_folder in folders:
        if auth_folder.id == user.root:
            root_found = True
        else:
            assert auth_folder == folder
    assert root_found


def test_user_ping():
    user_a = User.create()
    assert user_a is not None
    Folder.create(user_a, "Test", user_a.root)

    user_b, _, _ = User.authenticate(
        user_a.email, "foo", device="secondary-device"
    )
    folder = Folder.create(user_b, "Foo", user_b.root)
    assert folder is not None
    recipe = Recipe.create(user_b, "Bar", user_b.root, ["Test"], ["Test"])
    assert recipe is not None

    actions = user_a.ping()
    assert len(actions) == 4
    verify_action(actions[0], ItemType.Folder, ActionType.Create, folder.id)
    verify_action(actions[1], ItemType.Folder, ActionType.Modify, user_a.root)
    verify_action(actions[2], ItemType.Recipe, ActionType.Create, recipe.id)
    verify_action(actions[3], ItemType.Folder, ActionType.Modify, user_a.root)

    folder.modify(user_b, "FooFoo")
    recipe.modify(user_b, "Bar", ["123"], ["456"])

    actions = user_a.ping()
    assert len(actions) == 2
    verify_action(actions[0], ItemType.Folder, ActionType.Modify, folder.id)
    verify_action(actions[1], ItemType.Recipe, ActionType.Modify, recipe.id)

    folder.delete(user_b)
    recipe.delete(user_b)

    actions = user_a.ping()
    assert len(actions) == 4
    verify_action(actions[0], ItemType.Folder, ActionType.Delete, folder.id)
    verify_action(actions[1], ItemType.Folder, ActionType.Modify, user_a.root)
    verify_action(actions[2], ItemType.Recipe, ActionType.Delete, recipe.id)
    verify_action(actions[3], ItemType.Folder, ActionType.Modify, user_a.root)
