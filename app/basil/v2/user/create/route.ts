/*
** app/basil/v2/user/create/route.ts
*/

import { NextRequest, NextResponse } from "next/server";

import Token from "@/lib/models/basil/Token";
import User from "@/lib/models/basil/User";
import { hashPassword } from "@/lib/models/basil/utils";

export async function POST(request: NextRequest) {
    const body = await request.json();

    // Hash the password
    const password = body.password ? hashPassword(body.password) : null;
    // Then create the user model
    try {
        const user = await User.createUser(
            body.email, password,
            body.root, body.recipes, body.folders,
            body.device
        );
        // Generate a new token for the user
        // The token is used to authenticate with the WebSocket server and expires within 1 hour
        const token = await Token.issue(user.id);
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
        return NextResponse.json(null, { status: 400, statusText: message });
    }
}
