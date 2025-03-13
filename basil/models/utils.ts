/*
** basil/models/utils.ts
*/

import { HydratedDocument, Schema } from "mongoose";

import User, { IUser, IUserInfo } from "./User.ts";
import { debug } from "../../utils/log.ts";

function uuid(): string {
    return crypto.randomUUID().toString().toUpperCase();
}

async function userExists(email: string): Promise<boolean> {
    return await User.findOne({email: email}) !== null;
}

export async function createUser(
    email: string,
    password: string,
    root: string,
    recipes: Schema.Types.Mixed,
    folders: Schema.Types.Mixed
): Promise<IUserInfo> {
    // check for a pre-existing user with the same email
    if (await userExists(email)) {
        throw Error("A user with the given email address already exists.");
    }

    let user: HydratedDocument<IUser>;
    // create the root folder if one was not provided
    if (root) {
        user = new User({
            email: email,
            password: password,
            key: uuid(),
            root: root,
            recipes: recipes,
            folders: folders,
        });
    } else {
        const rootFolder = {
            "uuid": uuid(),
            "folderId": null,
            "name": "",
            "recipes": [],
            "subfolders": [],
        };
        user = new User({
            email: email,
            password: password,
            key: uuid(),
            root: rootFolder.uuid,
            recipes: [],
            folders: [rootFolder],
        });
    }

    await user.save();
    debug(`created new user ${user._id} with root folder ${user.root}`);

    return {
        id: user._id,
        email: user.email,
        key: user.key,
        root: user.root,
        recipes: user.recipes,
        folders: user.folders,
    };
}

export async function getUser(email: string, password: string): Promise<IUserInfo> {
    // search for the user matching the provided email/password
    const user = await User.findOne({email: email, password: password});
    if (!user) {
        throw Error(
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
        throw Error(`invalid user ID ${id}`);
    }
    // then assert that the provided key matches
    if (user.key != key) {
        throw Error("invalid user key");
    }
    return user;
}

export async function updateUser(
    id: string,
    key: string,
    root: string,
    recipes: Schema.Types.Mixed,
    folders: Schema.Types.Mixed
) {
    // retrieve the user and validate the key
    const user = await validateUserInfo(id, key);
    user.root = root;
    user.recipes = recipes;
    user.folders = folders;
    await user.save();
}
