/*
** recipe_book/router.ts
*/

// @deno-types="npm:@types/express@4"
import express from "npm:express@4.18";

import {
    createFolder,
    createRecipe,
    createUser,
    deleteFolder,
    deleteRecipe,
    getUser,
    updateFolder,
    updateRecipe,
    validateUserInfo
} from "./models/utils.js";
import { debug, error, info } from "../utils/log.ts";

const router = express.Router();

router.post("/recipes/register", async (req, res) => {
    info("POST /recipes/register");

    try {
        // create the user model
        await createUser(req.body.email, req.body.password);
        // retrieve the newly-created user info, including the root folder
        const userInfo = await getUser(req.body.email, req.body.password);
        debug(`POST /recipes/register: response: ${JSON.stringify(userInfo)}`);
        res.send(userInfo);
    } catch(err) {
        error(`POST /recipes/register: ${err.message}`);
        res.status(400).send(err.message);
    }
});

router.post("/recipes/login", async (req, res) => {
    info("POST /recipes/login");

    try {
        // retrieve the user info
        const userInfo = await getUser(req.body.email, req.body.password);
        debug(`POST /recipes/register: response: ${JSON.stringify(userInfo)}`);
        res.send(userInfo);
    } catch(err) {
        error(`POST /recipes/login: ${err.message}`);
        res.status(400).send(err.message);
    }
});

router.post("/recipes/create", async (req, res) => {
    info("POST /recipes/create");

    try {
        // validate the provided user info
        await validateUserInfo(req.body.userId, req.body.userKey);

        // create the recipe, if provided
        if (req.body.recipe) {
            if (typeof req.body.recipe === "object" && req.body.recipe !== null) {
                await createRecipe(
                    req.body.userId, req.body.recipe.uuid, req.body.recipe.folderId,
                    req.body.recipe.title, req.body.recipe.ingredients, req.body.recipe.instructions
                );
            } else {
                throw new Deno.errors.InvalidData(`invalid recipe "${req.body.recipe}"`);
            }
        }
        // create the folder, if provided
        if (req.body.folder) {
            if (typeof req.body.folder === "object" && req.body.folder !== null) {
                await createFolder(
                    req.body.userId, req.body.folder.uuid, req.body.folder.folderId,
                    req.body.folder.name, req.body.folder.recipes, req.body.folder.subfolders
                );
            } else {
                throw new Deno.errors.InvalidData(`invalid folder "${req.body.folder}"`);
            }
        }

        debug("POST /recipes/create: 200");
        res.sendStatus(200);
    } catch(err) {
        error(`POST /recipes/create: ${err.message}`);
        res.status(400).send(err.message);
    }
});

router.post("/recipes/update", async (req, res) => {
    info("POST /recipes/update");

    try {
        // validate the provided user info
        await validateUserInfo(req.body.userId, req.body.userKey);

        // update the recipes
        const recipes = req.body.recipes ? req.body.recipes : [];
        for (const recipe of recipes) {
            // sanitize recipe inputs
            if (typeof recipe === "object" && recipe !== null) {
                await updateRecipe(
                    recipe.uuid, recipe.folderId,
                    recipe.title, recipe.ingredients, recipe.instructions
                );
            } else {
                throw new Deno.errors.InvalidData(`invalid recipe "${recipe}"`);
            }
        }
        // update the folders
        const folders = req.body.folders ? req.body.folders : [];
        for (const folder of folders) {
            // sanitize folder inputs
            if (typeof folder === "object" && folder !== null) {
                await updateFolder(
                    folder.uuid, folder.folderId,
                    folder.name, folder.recipes, folder.subfolders
                );
            } else {
                throw new Deno.errors.InvalidData(`invalid folder "${folder}"`);
            }
        }

        debug("POST /recipes/update: 200");
        res.sendStatus(200);
    } catch(err) {
        error(`POST /recipes/update: ${err.message}`);
        res.status(400).send(err.message);
    }
});

router.post("/recipes/delete", async (req, res) => {
    info("POST /recipes/delete");

    try {
        // validate the provided user info
        await validateUserInfo(req.body.userId, req.body.userKey);

        // delete the recipes
        const recipes = req.body.recipes ? req.body.recipes : [];
        for (const uuid of recipes) {
            await deleteRecipe(uuid);
        }
        // delete the folders
        const folders = req.body.folders ? req.body.folders : [];
        for (const uuid of folders) {
            await deleteFolder(uuid);
        }

        debug("POST /recipes/delete: 200");
        res.sendStatus(200);
    } catch(err) {
        error(`POST /recipes/delete: ${err.message}`);
        res.status(400).send(err.message);
    }
});

export default router;
