/*
** recipe_book/models/utils.ts
*/

import { HydratedDocument, Schema } from "npm:mongoose@^6.7";

import User, { IUser, IUserInfo } from "./User.ts";
import { debug } from "../../utils/log.ts";

function uuid(): string {
    return crypto.randomUUID().toString().toUpperCase();
}

export async function createUser(email: string, password: string) {
    // TODO: check for pre-existing user

    const root = {
        "uuid": uuid(),
        "folderId": null,
        "name": "",
        "recipes": [],
        "subfolders": [],
    };
    const user = new User({
        email: email,
        password: password,
        key: uuid(),
        root: root.uuid,
        recipes: [],
        folders: [root],
    });

    await user.save();
    debug(`created new user ${user._id} with root folder ${root.uuid}`);
}

export async function getUser(email: string, password: string): Promise<IUserInfo> {
    // search for the user matching the provided email/password
    const user = await User.findOne({email: email, password: password});
    if (!user) {
        throw new Deno.errors.NotFound(
            "The email address or password you entered is incorrect. Please " +
            "try again."
        );
    }

    return {
        id: user._id,
        email: user.email,
        key: user.key,
        root: user.root,
        recipes: user.recipes,
        folders: user.folders,
    };
}

export async function validateUserInfo(id: string, key: string): Promise<HydratedDocument<IUser>> {
    // search for the user by ID
    const user = await User.findById(id);
    if (!user) {
        throw new Deno.errors.NotFound(`invalid user ID ${id}`);
    }
    // then assert that the provided key matches
    if (user.key != key) {
        throw new Deno.errors.InvalidData("invalid user key");
    }
    return user;
}

export async function updateUser(id: string, key: string, root: string, recipes: Schema.Types.Mixed, folders: Schema.Types.Mixed) {
    // retrieve the user and validate the key
    const user = await validateUserInfo(id, key);
    user.root = root;
    user.recipes = recipes;
    user.folders = folders;
    await user.save();
}
