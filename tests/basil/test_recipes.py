# tests/basil/test_recipes.py

import datetime
from typing import Generator

import pytest

from tests.common import DateTime, Folder, Recipe, User


@pytest.fixture(scope="module", autouse=True)
def recipes_user() -> Generator[User, None, None]:
    user = User.create(email="recipes@test.com")
    assert user is not None
    yield user

    # Delete the user to clean up
    user.delete()


###############################################################################
# Tests
###############################################################################


def test_recipe_create(recipes_user: User):
    recipe = Recipe.create(
        recipes_user, "Test", recipes_user.root, ["foo"], ["bar"]
    )
    assert recipe is not None

    dbrecipe = Recipe.get(recipe.id)
    assert dbrecipe is not None
    assert dbrecipe.id == recipe.id
    assert dbrecipe.title == recipe.title
    assert dbrecipe.parent == recipe.parent
    assert dbrecipe.ingredients == recipe.ingredients
    assert dbrecipe.instructions == recipe.instructions

    user = User.get(recipes_user.id)
    assert user is not None
    assert recipe.id in user.recipes

    root = Folder.get(recipes_user.root)
    assert root is not None
    assert recipe.id in root.recipes


def test_recipe_modify(recipes_user: User):
    recipe = Recipe.create(
        recipes_user, "Foo", recipes_user.root, ["abc"], ["def"]
    )
    assert recipe is not None

    recipe.modify(recipes_user, "Bar", ["123"], ["456"])

    dbrecipe = Recipe.get(recipe.id)
    assert dbrecipe is not None
    assert dbrecipe.title == "Bar"
    assert dbrecipe.ingredients == ["123"]
    assert dbrecipe.instructions == ["456"]


def test_recipe_modify_time_violation(recipes_user: User):
    recipe = Recipe.create(recipes_user, "Baz", recipes_user.root, [], [])
    assert recipe is not None
    recipe.modify(recipes_user, "Timestamped", [], [])

    timestamp = DateTime()
    timestamp.timestamp -= datetime.timedelta(hours=1)
    recipe.modify(
        recipes_user, "Error", [], [], timestamp=timestamp, success=False
    )


def test_recipe_delete(recipes_user: User):
    recipe = Recipe.create(recipes_user, "Delete", recipes_user.root, [], [])
    assert recipe is not None
    recipe.delete(recipes_user)
    Recipe.get(recipe.id, success=False)
