/*
** app/basil/v2/user/create/route.ts
*/

import { NextRequest, NextResponse } from "next/server";

import BasilDB from "@/lib/basil/db";
import { hashPassword } from "@/lib/utils";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const db = await BasilDB.getDriver();

    // Hash the password
    const password = body.password ? hashPassword(body.password) : undefined;
    // Then create the user model
    try {
        const user = await db.users.create(
            body.email, password,
            body.root, body.recipes, body.folders,
            body.device
        );
        // Generate a new token for the user
        // The token is used to authenticate with the WebSocket server and expires within 1 hour
        const token = await db.tokens.create(user.id);
        // Send authentication info back to the user
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
        console.error(`basil/v2/user/create: error: ${message}`);
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
