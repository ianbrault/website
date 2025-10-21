/*
** app/basil/v2/user/update/route.ts
*/

import { NextRequest, NextResponse } from "next/server";

import { server } from "@/lib/websocket/server";
import Token from "@/lib/models/basil/Token";
import User from "@/lib/models/basil/User";

export async function POST(request: NextRequest) {
    // This endpoint is added to allow command-line tools to push updates for users, it requires a
    // token so the user must be authenticated prior to calling this endpoint
    const body = await request.json();

    try {
        const user = await User.getById(body.userId);
        const token = await Token.getById(body.token);
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
        // Bump the sequence count
        user.sequence = user.sequence + 1;
        await user.save();
        // Notify any clients that are connected to the WebSocket server
        await server?.notifyClients(user.id);
        return new NextResponse();
    } catch(err) {
        const message = (err as Error).message;
        return NextResponse.json(null, { status: 400, statusText: message });
    }
}
