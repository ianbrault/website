/*
** recipe_book/router.ts
*/

// @deno-types="npm:@types/express@4"
import express from "npm:express@4.18";

import {
    createUser,
    getUser,
    updateUser,
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
        debug(`POST /recipes/login: response: ${JSON.stringify(userInfo)}`);
        res.send(userInfo);
    } catch(err) {
        error(`POST /recipes/login: ${err.message}`);
        res.status(400).send(err.message);
    }
});

router.post("/recipes/user/poke", async (req, res) => {
    info("POST /recipes/user/poke");

    try {
        // validate the provided user info
        await validateUserInfo(req.body.id, req.body.key);
        debug("POST /recipes/user/poke: 200");
        res.sendStatus(200);
    } catch(err) {
        error(`POST /recipes/user/poke: ${err.message}`);
        res.status(400).send(err.message);
    }
});

router.post("/recipes/user/update", async (req, res) => {
    info("POST /recipes/user/update");

    try {
        // update the stored user using the provided info
        await updateUser(
            req.body.id, req.body.key,
            req.body.root, req.body.recipes, req.body.folders
        );
        debug("POST /recipes/user/update: 200");
        res.sendStatus(200);
    } catch(err) {
        error(`POST /recipes/user/update: ${err.message}`);
        res.status(400).send(err.message);
    }
});

export default router;
