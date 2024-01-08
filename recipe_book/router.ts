/*
** recipe_book/router.ts
*/

// @deno-types="npm:@types/express@4"
import express from "npm:express@4.18";

import { createUser, retrieveUser } from "./models/utils.ts";
import { debug, info } from "../utils/log.ts";

const router = express.Router();

router.post("/recipes/register", async (req, res) => {
    info("POST /recipes/register");
    const email = req.body.email;
    const password = req.body.password;

    try {
        // create the user model
        await createUser(email, password);
        // retrieve the newly-created user info, including the root folder
        const userInfo = await retrieveUser(email, password);
        debug(`POST /recipes/register: response: ${JSON.stringify(userInfo)}`);
        res.send(userInfo);
    } catch(error) {
        res.status(400).send(error.message);
    }
});

router.post("/recipes/login", async (req, res) => {
    info("POST /recipes/login");
    const email = req.body.email;
    const password = req.body.password;

    try {
        // retrieve the user info
        const userInfo = await retrieveUser(email, password);
        debug(`POST /recipes/register: response: ${JSON.stringify(userInfo)}`);
        res.send(userInfo);
    } catch(error) {
        res.status(400).send(error.message);
    }
});

export default router;
