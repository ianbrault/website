/*
** app/basil/v2/user/authenticate/route.ts
*/

import { NextRequest, NextResponse } from "next/server";

import BasilDB from "@/lib/basil/db";
import { hashPassword } from "@/lib/utils";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const db = await BasilDB.getDriver();

    // Hash the password
    const password = body.password ? hashPassword(body.password) : undefined;
    // Get the user using the provided info
    try {
        const user = await db.users.findWithLogin(body.email, password);
        // If this is a new device for the user, add to the device list
        if (body.device && !user.containsDevice(body.device)) {
            user.devices.push(body.device);
            await db.users.update(user);
        }
        // generate a new token for the user
        // the token is used to authenticate with the WebSocket server and expires within 1 hour
        const token = await db.tokens.create(user.id);
        // send authentication info back to the user
        const response = {
            id: user.id,
            email: user.email,
            root: user.root,
            recipes: user.recipes,
            folders: user.folders,
            sequence: user.sequence,
            token: token.id,
        };
        return NextResponse.json(response);
    } catch(err) {
        const message = (err as Error).message;
        console.error(`basil/v2/user/authenticate: error: ${message}`);
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
