# tests/common.py

import abc
import datetime
import enum
import logging
import json
import typing

import bson.datetime_ms
import bson.objectid
import requests

LOG = logging.getLogger(__name__)


class Model(abc.ABC):

    PORT = 44000
    SESSION = requests.Session()

    @staticmethod
    def json_get(
        json_object: dict,
        key: str,
        type_object: typing.Type,
        list: bool = False,
        optional: bool = False,
    ) -> typing.Any:
        def type_parser(value):
            if value is None and optional:
                return None
            return type_object(value)

        if not optional:
            assert key in json_object
        value = json_object.get(key)
        if list:
            return (
                [type_parser(item) for item in value]
                if value is not None
                else []
            )
        return type_parser(value)

    @classmethod
    def _build_url(cls, url: str) -> str:
        return f"http://127.0.0.1:{cls.PORT}/basil/v2/{url}"

    @classmethod
    def _http_handler(
        cls, response: requests.Response, success: bool, no_body: bool
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

    @classmethod
    def http_get(
        cls, url: str, success: bool = True, no_body: bool = False
    ) -> dict | None:
        url = cls._build_url(url)
        LOG.debug(f"GET: {url}")
        response = cls.SESSION.get(url)
        return cls._http_handler(response, success, no_body)

    @classmethod
    def http_post(
        cls,
        url: str,
        body: dict[str, typing.Any],
        success: bool = True,
        no_body: bool = False,
    ) -> dict | None:
        url = cls._build_url(url)
        LOG.debug(f"POST: {url}")
        LOG.debug(
            f"POST: request: {json.dumps(body, sort_keys=True, indent=2)}"
        )
        response = cls.SESSION.post(url, json=body)
        return cls._http_handler(response, success, no_body)

    def serialize(self) -> typing.Any:
        return NotImplemented


class ObjectId(Model):

    def __init__(self, object_id: ObjectIdType | None = None):
        super().__init__()
        if object_id is None:
            object_id = bson.objectid.ObjectId()

        if isinstance(object_id, str):
            self.id = object_id
        elif isinstance(object_id, dict):
            self.id: str = self.json_get(object_id, "$oid", str)
        elif isinstance(object_id, bson.objectid.ObjectId):
            self.id = str(object_id)
        elif isinstance(object_id, ObjectId):
            self.id = str(object_id.id)
        else:
            raise TypeError(
                f"{self.__name__}: invalid object_id type {type(object_id).__name__}"
            )

    def __str__(self) -> str:
        return self.id

    def __repr__(self) -> str:
        return f"ObjectId({self.id})"

    def __eq__(self, other) -> bool:
        other = ObjectId(other)
        return self.id == other.id

    def serialize(self) -> typing.Any:
        return self.id


type ObjectIdType = str | dict | bson.objectid.ObjectId | ObjectId


class ModelWithId(Model):

    def __init__(self, json_body: dict | None):
        super().__init__()
        assert json_body is not None
        self.id: ObjectId = self.json_get(json_body, "_id", ObjectId)

    def __eq__(self, other) -> bool:
        if not issubclass(other.__class__, ModelWithId):
            return False
        return self.id == other.id


class DateTime(Model):

    def __init__(self, json_body: dict | None):
        super().__init__()
        assert json_body is not None

        timestamp_ms = self.json_get(
            self.json_get(json_body, "$date", dict), "$numberLong", str
        )
        self.timestamp = int(timestamp_ms)

    @property
    def datetime(self) -> datetime.datetime:
        return bson.datetime_ms.DatetimeMS(self.timestamp).as_datetime()

    def __str__(self) -> str:
        return self.datetime.isoformat()

    def __repr__(self) -> str:
        return f"DateTime({self.datetime.isoformat()})"

    def serialize(self) -> typing.Any:
        return {"$date": {"$numberLong": self.timestamp}}


class ActionType(enum.StrEnum):
    Create = "Create"
    Modify = "Modify"
    Delete = "Delete"


class ItemType(enum.StrEnum):
    Recipe = "Recipe"
    Folder = "Folder"


class Action(Model):

    def __init__(self, json_body: dict | None):
        super().__init__()
        assert json_body is not None

        self.timestamp: DateTime = self.json_get(
            json_body, "timestamp", DateTime
        )
        self.item: ItemType = self.json_get(json_body, "item", ItemType)
        self.action: ActionType = self.json_get(json_body, "action", ActionType)
        self.item_id: ObjectId = self.json_get(json_body, "item_id", ObjectId)

    def __repr__(self) -> str:
        return f"Action(item={self.item}, action={self.action}, item_id={self.item_id}, timestamp={self.timestamp})"

    def serialize(self) -> typing.Any:
        return {
            "timestamp": self.timestamp.serialize(),
            "item": self.item.value,
            "action": self.action.value,
            "item_id": self.item_id.serialize(),
        }


class ActionJournal(Model):

    def __init__(self, json_body: dict | None):
        super().__init__()
        assert json_body is not None

        self.data: list[Action | None] = self.json_get(
            json_body, "data", Action, list=True, optional=True
        )

    def serialize(self) -> typing.Any:
        return {
            "data": [
                action.serialize() if action is not None else None
                for action in self.data
            ]
        }


class User(ModelWithId):

    sequence = 0

    def __init__(
        self,
        json_body: dict | None,
        device: str = "test-device",
    ):
        super().__init__(json_body)
        assert json_body is not None

        self.device = device
        self.token: ObjectId | None = None
        self.root: ObjectId = self.json_get(json_body, "root", ObjectId)
        self.email: str = self.json_get(json_body, "email", str)
        self.folders: list[ObjectId] = self.json_get(
            json_body, "folders", ObjectId, list=True
        )
        self.recipes: list[ObjectId] = self.json_get(
            json_body, "recipes", ObjectId, list=True
        )
        self.action_journal: ActionJournal = self.json_get(
            json_body, "action_journal", ActionJournal
        )

    @property
    def authentication_fields(self) -> dict:
        assert self.token is not None
        return {
            "user_id": self.id.serialize(),
            "token_id": self.token.serialize(),
            "device": self.device,
        }

    @classmethod
    def generate_email(cls) -> str:
        email = f"test-{cls.sequence}@test.com"
        User.sequence += 1
        return email

    @classmethod
    def get(cls, user_id: ObjectIdType, success: bool = True) -> User | None:
        user_id = ObjectId(user_id)
        response = cls.http_get(f"user/{user_id.id}", success=success)
        if response is not None:
            return cls(response)

    @classmethod
    def create(
        cls,
        email: str | None = None,
        root: ObjectIdType | None = None,
        device: str = "test-device",
        success: bool = True,
    ) -> User | None:
        request = {
            "email": email if email is not None else cls.generate_email(),
            "password": "foo",
            "device": device,
        }
        if root is not None:
            request["root"] = ObjectId(root).serialize()

        response = cls.http_post("user/create", request, success=success)
        if not success:
            return None
        assert response is not None
        user_id = cls.json_get(response, "id", ObjectId)
        user_email = cls.json_get(response, "email", str)
        assert user_email == request["email"]
        LOG.info(f"Created user {user_email} (ID: {user_id})")

        user = cls.get(user_id)
        assert user is not None
        user.device = device
        user.token = cls.json_get(response, "token", ObjectId)
        return user

    @classmethod
    def authenticate(
        cls, email: str, password: str, device: str = "test-device"
    ) -> tuple[User, list[Folder], list[Recipe]]:
        request = {
            "email": email,
            "password": password,
            "device": device,
        }
        response = cls.http_post("user/authenticate", request)
        assert response is not None

        folders = cls.json_get(response, "folders", Folder, list=True)
        recipes = cls.json_get(response, "recipes", Recipe, list=True)
        user_json = {
            "_id": cls.json_get(response, "id", ObjectId),
            "email": cls.json_get(response, "email", str),
            "root": cls.json_get(response, "root", ObjectId),
            "email": cls.json_get(response, "email", str),
            "folders": [folder.id for folder in folders],
            "recipes": [recipe.id for recipe in recipes],
            "action_journal": ActionJournal({}).serialize(),
        }
        user = cls(user_json, device=device)
        assert user.email == email
        user.token = cls.json_get(response, "token", ObjectId)
        return (user, folders, recipes)

    def delete(self):
        LOG.info(f"Deleting user {self.email} (ID: {self.id})")
        request = {
            "email": self.email,
            "password": "foo",
        }
        self.http_post("user/delete", request, no_body=True)

    def ping(self) -> list[Action]:
        response = self.http_post("user/ping", self.authentication_fields)
        assert response is not None
        actions = self.json_get(response, "actions", Action, list=True)
        LOG.info(
            f"User {self.email} (ID: {self.id}) pinged for {len(actions)} actions: {actions}"
        )
        return actions


class Folder(ModelWithId):

    def __init__(self, json_body: dict | None):
        super().__init__(json_body)
        assert json_body is not None

        self.name: str = self.json_get(json_body, "name", str)
        self.parent: ObjectId = self.json_get(
            json_body, "parent", ObjectId, optional=True
        )
        self.recipes: list[ObjectId] = self.json_get(
            json_body, "recipes", ObjectId, list=True
        )
        self.subfolders: list[ObjectId] = self.json_get(
            json_body, "subfolders", ObjectId, list=True
        )

    @classmethod
    def get(
        cls, folder_id: ObjectIdType, success: bool = True
    ) -> Folder | None:
        folder_id = ObjectId(folder_id)
        response = cls.http_get(f"folder/{folder_id.id}", success=success)
        if response is not None:
            return cls(response)

    @classmethod
    def create(
        cls,
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
        response = cls.http_post("folder/create", request, success=success)
        folder = cls(response)
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
        response = self.http_post("folder/modify", request, no_body=True)
        assert response is not None
        self.name = name

    def delete(self, user: User):
        LOG.info(f"Deleting folder {self.name!r} (ID: {self.id})")
        request = {
            **user.authentication_fields,
            "folder_id": self.id.serialize(),
        }
        self.http_post("folder/delete", request, no_body=True)


class Recipe(ModelWithId):

    def __init__(self, json_body: dict | None):
        super().__init__(json_body)
        assert json_body is not None

        self.title: str = self.json_get(json_body, "title", str)
        self.parent: ObjectId = self.json_get(json_body, "parent", ObjectId)
        self.ingredients: list[str] = self.json_get(
            json_body, "ingredients", str, list=True
        )
        self.instructions: list[str] = self.json_get(
            json_body, "instructions", str, list=True
        )

    @classmethod
    def get(
        cls, recipe_id: ObjectIdType, success: bool = True
    ) -> Recipe | None:
        recipe_id = ObjectId(recipe_id)
        response = cls.http_get(f"recipe/{recipe_id.id}", success=success)
        if response is not None:
            return cls(response)

    @classmethod
    def create(
        cls,
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
        response = cls.http_post("recipe/create", request, success=success)
        recipe = cls(response)
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
        response = self.http_post("recipe/modify", request, no_body=True)
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
        self.http_post("recipe/delete", request, no_body=True)
