/*
** basil/router/v2.ts
*/

import express from "express";

import Token from "../models/Token.ts";
import User from "../models/User.ts";
import { hashPassword } from "../models/utils.ts";
import { debug, error, info } from "../../utils/log.ts";

const router = express.Router();

router.post("/basil/v2/user/create", async (req, res) => {
    info("POST /basil/v2/user/create");

    try {
        // hash the password
        const password = req.body.password ? hashPassword(req.body.password) : null;
        // then create the user model
        const user = await User.createUser(
            req.body.email, password,
            req.body.root, req.body.recipes, req.body.folders,
            req.body.device
        );
        // generate a new token for the user
        // the token is used to authenticate with the WebSocket server and expires within 1 hour
        const token = await Token.issue(user.id);
        // send authentication info back to the user
        const body = {
            id: user.id,
            email: user.email,
            root: user.root,
            recipes: user.recipes,
            folders: user.folders,
            sequence: user.sequence,
            token: token.id,
        };
        debug(`POST /basil/v2/user/create: response: ${JSON.stringify(body)}`);
        res.send(body);
    } catch(err) {
        error(`POST /basil/v2/user/create: ${err.message}`);
        res.status(400).send(err.message);
    }
});

router.post("/basil/v2/user/delete", async (req, res) => {
    info("POST /basil/v2/user/delete");

    try {
        // hash the password
        const password = req.body.password ? hashPassword(req.body.password) : null;
        // retrieve the user matching the provided info and delete it
        const user = await User.getByEmail(req.body.email, password);
        await user.deleteOne();
        debug("POST /basil/v2/user/delete: 200");
        res.sendStatus(200);
    } catch(err) {
        error(`POST /basil/v2/user/delete: ${err.message}`);
        res.status(400).send(err.message);
    }
});

router.post("/basil/v2/user/authenticate", async (req, res) => {
    info("POST /basil/v2/user/authenticate");

    try {
        // hash the password and retrieve the user info
        const password = req.body.password ? hashPassword(req.body.password) : null;
        const user = await User.getByEmail(req.body.email, password);
        // if this is a new device for the user, add to the device list
        if (req.body.device && !user.containsDevice(req.body.device)) {
            user.devices.push(req.body.device);
            await user.save();
        }
        // generate a new token for the user
        // the token is used to authenticate with the WebSocket server and expires within 1 hour
        const token = await Token.issue(user.id);
        // send authentication info back to the user
        const body = {
            id: user.id,
            email: user.email,
            root: user.root,
            recipes: user.recipes,
            folders: user.folders,
            sequence: user.sequence,
            token: token.id,
        };
        debug(`POST /basil/v2/user/authenticate: response: ${JSON.stringify(body)}`);
        res.send(body);
    } catch(err) {
        error(`POST /basil/v2/user/authenticate: ${err.message}`);
        res.status(401).send(err.message);
    }
});

export default router;
