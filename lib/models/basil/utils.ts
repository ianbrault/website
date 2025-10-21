/*
** lib/models/basil/utils.ts
*/

import { createHash } from "crypto";

export function hashPassword(password: string): string {
    return createHash("sha256").update(password).digest("base64");
}
