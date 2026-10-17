# tests/common.py

import abc
import logging
import json
import typing

import bson.objectid
import requests

LOG = logging.getLogger(__name__)


class Model(abc.ABC):

    PORT = 44000

    @staticmethod
    def json_get(
        json_object: dict,
        key: str,
        type_object: typing.Type,
        list: bool = False,
        optional: bool = False,
    ) -> typing.Any:
        if not optional:
            assert key in json_object
        value = json_object.get(key)
        if value is None and optional:
            return None
        if list:
            return [type_object(value) for value in json_object[key]]
        else:
            return type_object(json_object[key])

    @staticmethod
    def _build_url(url: str) -> str:
        return f"http://127.0.0.1:{Model.PORT}/basil/v2/{url}"

    @staticmethod
    def _http_handler(
        response: requests.Response, success: bool, no_body: bool
    ) -> dict | None:
        if success:
            assert response.status_code == 200
            if no_body:
                body = {}
            else:
                body = response.json()
                LOG.debug(
                    f"Response: {json.dumps(body, sort_keys=True, indent=2)}"
                )
            return body
        else:
            assert response.status_code == 400
            return None

    @staticmethod
    def http_get(
        url: str, success: bool = True, no_body: bool = False
    ) -> dict | None:
        url = Model._build_url(url)
        LOG.debug(f"GET: {url}")
        response = requests.get(url)
        return Model._http_handler(response, success, no_body)

    @staticmethod
    def http_post(
        url: str,
        body: dict[str, typing.Any],
        success: bool = True,
        no_body: bool = False,
    ) -> dict | None:
        url = Model._build_url(url)
        LOG.debug(f"POST: {url}")
        LOG.debug(
            f"POST: request: {json.dumps(body, sort_keys=True, indent=2)}"
        )
        response = requests.post(url, json=body)
        return Model._http_handler(response, success, no_body)

    def serialize(self) -> typing.Any:
        return NotImplemented


class ObjectId(Model):

    def __init__(self, object_id: ObjectIdType):
        super().__init__()
        if isinstance(object_id, str):
            self.id = object_id
        elif isinstance(object_id, dict):
            self.id = self.json_get(object_id, "$oid", str)
        elif isinstance(object_id, bson.objectid.ObjectId):
            self.id = str(object_id)
        elif isinstance(object_id, ObjectId):
            self.id = object_id.id
        else:
            raise TypeError(
                f"{self.__name__}: invalid object_id type {type(object_id).__name__}"
            )

    def __str__(self) -> str:
        return self.id

    def __eq__(self, other) -> bool:
        other = ObjectId(other)
        return self.id == other.id

    def serialize(self) -> typing.Any:
        return self.id


type ObjectIdType = str | dict | bson.objectid.ObjectId | ObjectId


class User(Model):

    sequence = 0

    @property
    def authentication_fields(self) -> dict:
        assert self.token is not None
        return {
            "user_id": self.id.serialize(),
            "token_id": self.token.serialize(),
            "device": "test-device",
        }

    def __init__(self, json_body: dict | None):
        assert json_body is not None
        super().__init__()

        self.token: ObjectId | None = None
        self.id = self.json_get(json_body, "_id", ObjectId)
        self.root = self.json_get(json_body, "root", ObjectId)
        self.email = self.json_get(json_body, "email", str)
        self.folders = self.json_get(json_body, "folders", ObjectId, list=True)
        self.recipes = self.json_get(json_body, "recipes", ObjectId, list=True)

    @staticmethod
    def generate_email() -> str:
        email = f"test-{User.sequence}@test.com"
        User.sequence += 1
        return email

    @staticmethod
    def get(user_id: ObjectIdType, success: bool = True) -> User | None:
        user_id = ObjectId(user_id)
        response = Model.http_get(f"user/{user_id.id}", success=success)
        if response is not None:
            return User(response)

    @staticmethod
    def create(
        email: str | None = None,
        root: ObjectIdType | None = None,
        success: bool = True,
    ) -> User | None:
        request = {
            "email": email if email is not None else User.generate_email(),
            "password": "foo",
            "device": "test-device",
        }
        if root is not None:
            request["root"] = ObjectId(root).serialize()

        response = Model.http_post("user/create", request, success=success)
        if not success:
            return None
        assert response is not None
        user_id = User.json_get(response, "id", ObjectId)
        user_email = User.json_get(response, "email", str)
        assert user_email == request["email"]
        LOG.info(f"Created user {user_email} (ID: {user_id})")

        user = User.get(user_id)
        assert user is not None
        user.token = User.json_get(response, "token", ObjectId)
        return user

    def delete(self):
        LOG.info(f"Deleting user {self.email} (ID: {self.id})")
        request = {
            "email": self.email,
            "password": "foo",
        }
        Model.http_post("user/delete", request, no_body=True)


class Folder(Model):

    def __init__(self, json_body: dict | None):
        assert json_body is not None
        super().__init__()

        self.id = self.json_get(json_body, "_id", ObjectId)
        self.name = self.json_get(json_body, "name", str)
        self.parent = self.json_get(
            json_body, "parent", ObjectId, optional=True
        )
        self.recipes = self.json_get(json_body, "recipes", ObjectId, list=True)
        self.subfolders = self.json_get(
            json_body, "subfolders", ObjectId, list=True
        )

    @staticmethod
    def get(folder_id: ObjectIdType, success: bool = True) -> Folder | None:
        folder_id = ObjectId(folder_id)
        response = Model.http_get(f"folder/{folder_id.id}", success=success)
        if response is not None:
            return Folder(response)

    @staticmethod
    def create(
        user: User,
        name: str,
        parent: ObjectIdType | None,
        success: bool = True,
    ) -> Folder | None:
        request = {
            **user.authentication_fields,
            "name": name,
            "parent": None if parent is None else ObjectId(parent).serialize(),
        }
        response = Model.http_post("folder/create", request, success=success)
        folder = Folder(response)
        assert folder.name == name
        assert folder.parent == request["parent"]
        assert folder.recipes == []
        assert folder.subfolders == []
        LOG.info(f"Created folder {folder.name!r} (ID: {folder.id})")
        return folder

    def modify(self, user: User, name: str):
        request = {
            **user.authentication_fields,
            "folder_id": self.id.serialize(),
            "name": name,
        }
        response = Model.http_post("folder/modify", request, no_body=True)
        assert response is not None
        self.name = name

    def delete(self, user: User):
        LOG.info(f"Deleting folder {self.name!r} (ID: {self.id})")
        request = {
            **user.authentication_fields,
            "folder_id": self.id.serialize(),
        }
        Model.http_post("folder/delete", request, no_body=True)


class Recipe(Model):

    def __init__(self, json_body: dict | None):
        assert json_body is not None
        super().__init__()

        self.id = self.json_get(json_body, "_id", ObjectId)
        self.title = self.json_get(json_body, "title", str)
        self.parent = self.json_get(json_body, "parent", ObjectId)
        self.ingredients = self.json_get(
            json_body, "ingredients", str, list=True
        )
        self.instructions = self.json_get(
            json_body, "instructions", str, list=True
        )

    @staticmethod
    def get(recipe_id: ObjectIdType, success: bool = True) -> Recipe | None:
        recipe_id = ObjectId(recipe_id)
        response = Model.http_get(f"recipe/{recipe_id.id}", success=success)
        if response is not None:
            return Recipe(response)

    @staticmethod
    def create(
        user: User,
        title: str,
        parent: ObjectIdType,
        ingredients: list[str],
        instructions: list[str],
        success: bool = True,
    ) -> Recipe | None:
        request = {
            **user.authentication_fields,
            "title": title,
            "parent": None if parent is None else ObjectId(parent).serialize(),
            "ingredients": ingredients,
            "instructions": instructions,
        }
        response = Model.http_post("recipe/create", request, success=success)
        recipe = Recipe(response)
        assert recipe.title == title
        assert recipe.parent == request["parent"]
        assert recipe.ingredients == ingredients
        assert recipe.instructions == instructions
        LOG.info(f"Created recipe {recipe.title!r} (ID: {recipe.id})")
        return recipe

    def modify(
        self,
        user: User,
        title: str,
        ingredients: list[str],
        instructions: list[str],
    ):
        request = {
            **user.authentication_fields,
            "recipe_id": self.id.serialize(),
            "title": title,
            "ingredients": ingredients,
            "instructions": instructions,
        }
        response = Model.http_post("recipe/modify", request, no_body=True)
        assert response is not None
        self.title = title
        self.ingredients = ingredients
        self.instructions = instructions

    def delete(self, user: User):
        LOG.info(f"Deleting recipe {self.title!r} (ID: {self.id})")
        request = {
            **user.authentication_fields,
            "recipe_id": self.id.serialize(),
        }
        Model.http_post("recipe/delete", request, no_body=True)
