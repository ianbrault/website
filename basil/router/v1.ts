/*
** basil/router/v1.ts
*/

import express from "express";

import { deleteUser } from "../models/utils.ts";
import { debug, error, info } from "../../utils/log.ts";

const router = express.Router();

/*
** NOTE: Basil v1 API is deprecated
** These routes are left in place to send error messages back to clients and
** will be removed at a later date.
*/
const MESSAGE = "This endpoint has been deprecated. Update to the newest version of the app."

router.post("/basil/register", async (_, res) => {
    info("POST /basil/register: deprecated");
    res.status(400).send(MESSAGE);
});

router.post("/basil/login", async (_, res) => {
    info("POST /basil/login: deprecated");
    res.status(400).send(MESSAGE);
});

router.post("/basil/user/poke", async (_, res) => {
    info("POST /basil/user/poke: deprecated");
    res.status(400).send(MESSAGE);
});

router.post("/basil/user/update", async (_, res) => {
    info("POST /basil/user/update: deprecated");
    res.status(400).send(MESSAGE);
});

router.post("/basil/user/delete", async (req, res) => {
    info("POST /basil/user/delete");

    try {
        // delete the stored user using the provided info
        await deleteUser(req.body.id, req.body.key, req.body.password);
        debug("POST /basil/user/delete: 200");
        res.sendStatus(200);
    } catch(err) {
        error(`POST /basil/user/delete: ${err.message}`);
        res.status(400).send(err.message);
    }
});

export default router;
