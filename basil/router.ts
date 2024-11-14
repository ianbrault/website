/*
** basil/router.ts
*/

import express from "express";

import {
    createUser,
    getUser,
    updateUser,
    validateUserInfo
} from "./models/utils.ts";
import { debug, error, info } from "../utils/log.ts";

const router = express.Router();

router.post("/basil/register", async (req, res) => {
    info("POST /basil/register");

    try {
        // create the user model
        const userInfo = await createUser(
            req.body.email, req.body.password,
            req.body.root, req.body.recipes, req.body.folders
        );
        debug(`POST /basil/register: response: ${JSON.stringify(userInfo)}`);
        res.send(userInfo);
    } catch(err) {
        error(`POST /basil/register: ${err.message}`);
        res.status(400).send(err.message);
    }
});

router.post("/basil/login", async (req, res) => {
    info("POST /basil/login");

    try {
        // retrieve the user info
        const userInfo = await getUser(req.body.email, req.body.password);
        debug(`POST /basil/login: response: ${JSON.stringify(userInfo)}`);
        res.send(userInfo);
    } catch(err) {
        error(`POST /basil/login: ${err.message}`);
        res.status(400).send(err.message);
    }
});

router.post("/basil/user/poke", async (req, res) => {
    info("POST /basil/user/poke");

    try {
        // validate the provided user info
        await validateUserInfo(req.body.id, req.body.key);
        debug("POST /basil/user/poke: 200");
        res.sendStatus(200);
    } catch(err) {
        error(`POST /basil/user/poke: ${err.message}`);
        res.status(400).send(err.message);
    }
});

router.post("/basil/user/update", async (req, res) => {
    info("POST /basil/user/update");

    try {
        // update the stored user using the provided info
        await updateUser(
            req.body.id, req.body.key,
            req.body.root, req.body.recipes, req.body.folders
        );
        debug("POST /basil/user/update: 200");
        res.sendStatus(200);
    } catch(err) {
        error(`POST /basil/user/update: ${err.message}`);
        res.status(400).send(err.message);
    }
});

export default router;
