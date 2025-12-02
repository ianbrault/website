/*
** app/basil/v2/user/update/route.ts
*/

import { NextRequest, NextResponse } from "next/server";

import BasilDB from "@/lib/basil/db";

export async function POST(request: NextRequest) {
    // This endpoint is added to allow command-line tools to push updates for users, it requires a
    // token so the user must be authenticated prior to calling this endpoint
    const body = await request.json();
    const db = await BasilDB.getDriver();

    try {
        const user = await db.users.find(body.userId);
        const token = await db.tokens.find(body.token);
        // Verify that the token is valid for the user
        if (token.user != user.id) {
            throw new Error(`Token does not match for user ${body.userId}`);
        }
        // Verify that the token has not expired
        const now = new Date();
        if (now > token.expiration) {
            throw new Error(`Token expired at ${token.expiration.toUTCString()}`);
        }
        // Update the user info
        user.root = body.root;
        user.recipes = body.recipes;
        user.folders = body.folders;
        await db.users.update(user);
        // Notify any clients that are connected to the WebSocket server
        // FIXME: notify via localhost WebSocket client connection
        // await server?.notifyClients(user.id);
        return new NextResponse();
    } catch(err) {
        const message = (err as Error).message;
        console.error(`basil/v2/user/update: error: ${message}`);
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
