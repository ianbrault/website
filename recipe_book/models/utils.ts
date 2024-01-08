/*
** recipe_book/models/utils.ts
*/

import RecipeFolder from "./RecipeFolder.ts";
import User from "./User.ts";

function uuid(): string {
    return crypto.randomUUID().toString().toUpperCase();
}

export async function createUser(email: string, password: string) {
    // TODO: check for pre-existing user

    // first create the root folder
    const root = new RecipeFolder({
        uuid: uuid(),
        folderId: null,
        name: "",
        recipes: [],
        subfolders: [],
    });

    // then create and save the user
    const user = new User({
        email: email,
        password: password,
        key: uuid(),
        root: root.uuid,
        recipes: [],
        folders: [root],
    });
    await user.save();
}

export async function retrieveUser(email: string, password: string) {
    // first search for the user matching the provided email/password
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
