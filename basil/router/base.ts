/*
** basil/router/base.ts
*/

import express from "express";

import v1 from "./v1.ts";
import v2 from "./v2.ts";

const router = express.Router();
router.use(v1);
router.use(v2);
export default router;
