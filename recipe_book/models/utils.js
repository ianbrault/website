/*
** recipe_book/models/utils.ts
*/

import Recipe from "./Recipe.js";
import RecipeFolder from "./RecipeFolder.js";
import User from "./User.js";

import { debug } from "../../utils/log.ts";

function uuid() {
    return crypto.randomUUID().toString().toUpperCase();
}

export async function createUser(email, password) {
    // TODO: check for pre-existing user

    const rootId = uuid();
    const user = new User({
        email: email,
        password: password,
        key: uuid(),
        root: rootId,
    });
    const root = new RecipeFolder({
        userId: user._id,
        uuid: rootId,
        folderId: null,
        name: "",
        recipes: [],
        subfolders: [],
    });

    await root.save();
    await user.save();
    debug(`created new user ${user._id} with root folder ${rootId}`);
}

export async function getUser(email, password) {
    // first search for the user matching the provided email/password
    const user = await User.findOne({email: email, password: password});
    if (!user) {
        throw new Deno.errors.NotFound(
            "The email address or password you entered is incorrect. Please " +
            "try again."
        );
    }

    const recipes = [];
    const userRecipes = await Recipe.find({userId: user._id});
    for (const recipe of userRecipes) {
        recipes.push({
            uuid: recipe.uuid,
            folderId: recipe.folderId,
            title: recipe.title,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
        });
    }

    const folders = [];
    const userFolders = await RecipeFolder.find({userId: user._id});
    for (const folder of userFolders) {
        folders.push({
            uuid: folder.uuid,
            folderId: folder.folderId,
            name: folder.name,
            recipes: folder.recipes,
            subfolders: folder.subfolders,
        });
    }

    return {
        id: user._id,
        email: user.email,
        key: user.key,
        root: user.root,
        recipes: recipes,
        folders: folders,
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
}

export async function createRecipe(userId, uuid, folderId, title, ingredients, instructions) {
    // get the parent folder first
    const parentFolder = await RecipeFolder.findOne({uuid: folderId});
    if (!parentFolder) {
        throw new Deno.errors.NotFound(`missing parent folder ${folderId}`);
    }

    // create the new recipe object
    const recipe = new Recipe({
        userId: userId,
        uuid: uuid,
        folderId: folderId,
        title: title,
        ingredients: ingredients,
        instructions: instructions,
    });
    await recipe.save();

    // add the recipe to the parent folder
    parentFolder.recipes.push(uuid);
    await parentFolder.save();

    debug(`created recipe ${recipe.uuid}`);
}

export async function updateRecipe(uuid, folderId, title, ingredients, instructions) {
    // get the recipe
    const recipe = await Recipe.findOne({uuid: uuid});
    if (!recipe) {
        throw new Deno.errors.NotFound(`missing recipe ${uuid}`);
    }

    // update the recipe
    recipe.folderId = folderId;
    recipe.title = title;
    recipe.ingredients = ingredients;
    recipe.instructions = instructions;
    await recipe.save();
}

export async function createFolder(userId, uuid, folderId, name, recipes, subfolders) {
    // get the parent folder first
    const parentFolder = await RecipeFolder.findOne({uuid: folderId});
    if (!parentFolder) {
        throw new Deno.errors.NotFound(`missing parent folder ${folderId}`);
    }

    // create the new folder object
    const folder = new RecipeFolder({
        userId: userId,
        uuid: uuid,
        folderId: folderId,
        name: name,
        recipes: recipes,
        subfolders: subfolders,
    });
    await folder.save();

    // add the recipe to the parent folder
    parentFolder.subfolders.push(uuid);
    await parentFolder.save();

    debug(`created folder ${folder.uuid}`);
}

export async function updateFolder(uuid, folderId, name, recipes, subfolders) {
    // get the folder
    const folder = await RecipeFolder.findOne({uuid: uuid});
    if (!folder) {
        throw new Deno.errors.NotFound(`missing folder ${uuid}`);
    }

    // update the folder
    folder.folderId = folderId;
    folder.name = name;
    folder.recipes = recipes;
    folder.subfolders = subfolders;
    await folder.save();
}
