/*
** basil/models/utils.ts
*/

import { createHash } from "crypto";
import { HydratedDocument, Schema } from "mongoose";

import User, { IUser, IUserMethods } from "./User.ts";

export function hashPassword(password: string): string {
    return createHash("sha256").update(password).digest("base64");
}

// TODO: remove with v1 deprecation
export async function validateUserInfo(id: string, key: string)
    : Promise<HydratedDocument<IUser, IUserMethods>>
{
    // search for the user by ID
    const user = await User.findById(id);
    if (!user) {
        throw new Error(`invalid user ID ${id}`);
    }
    // then assert that the provided key matches
    if (user.key != key) {
        throw new Error("invalid user key");
    }
    return user;
}

// TODO: remove with v1 deprecation
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

// TODO: remove with v1 deprecation
export async function deleteUser(
    id: string,
    key: string,
    password: string,
) {
    // retrieve the user and validate the key
    const user = await validateUserInfo(id, key);
    if (user.password != password) {
        throw new Error("password does not match");
    }
    await user.deleteOne();
}
