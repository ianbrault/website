/*
** basil/models/utils.ts
*/

import { HydratedDocument, Schema } from "mongoose";

import User, { IUser, IUserMethods, IUserInfo } from "./User.ts";
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
    folders: Schema.Types.Mixed,
    device: string,
): Promise<IUserInfo> {
    // check for a pre-existing user with the same email
    if (await userExists(email)) {
        throw Error("A user with the given email address already exists.");
    }

    let user: HydratedDocument<IUser, IUserMethods>;
    // create the root folder if one was not provided
    if (root) {
        user = new User({
            email: email,
            password: password,
            key: uuid(),
            root: root,
            recipes: recipes,
            folders: folders,
            devices: device ? [device] : [],
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
            devices: device ? [device] : [],
        });
    }

    await user.save();
    debug(`created new user ${user._id} with root folder ${user.root}`);
    return user.info();
}

export async function getUser(email: string, password: string)
    : Promise<HydratedDocument<IUser, IUserMethods>>
{
    // search for the user matching the provided email/password
    const user = await User.findOne({email: email, password: password});
    if (!user) {
        throw Error(
            "The email address or password you entered is incorrect. Please " +
            "try again."
        );
    }
    return user;
}

export async function validateUserInfo(id: string, key: string)
    : Promise<HydratedDocument<IUser, IUserMethods>>
{
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

export async function deleteUser(
    id: string,
    key: string,
    password: string,
) {
    // retrieve the user and validate the key
    const user = await validateUserInfo(id, key);
    if (user.password != password) {
        throw Error("password does not match");
    }
    await user.deleteOne();
}
