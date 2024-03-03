/*
** recipe_book/models/utils.ts
*/

import RecipeFolder from "./RecipeFolder.js";
import User from "./User.js";

import { debug } from "../../utils/log.ts";

function uuid() {
    return crypto.randomUUID().toString().toUpperCase();
}

export async function createUser(email, password) {
    // TODO: check for pre-existing user

    const root = new RecipeFolder({
        uuid: uuid(),
        folderId: null,
        name: "",
        recipes: [],
        subfolders: [],
    });
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

export async function getUser(email, password) {
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

export async function validateUserInfo(id, key) {
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

export async function updateUser(id, key, root, recipes, folders) {
    // retrieve the user and validate the key
    const user = await validateUserInfo(id, key);
    user.root = root;
    user.recipes = recipes;
    user.folders = folders;
    await user.save();
}
