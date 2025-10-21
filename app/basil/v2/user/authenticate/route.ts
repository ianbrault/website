/*
** app/basil/v2/user/authenticate/route.ts
*/

import { NextRequest, NextResponse } from "next/server";

import Token from "@/lib/models/basil/Token";
import User from "@/lib/models/basil/User";
import { hashPassword } from "@/lib/models/basil/utils";

export async function POST(request: NextRequest) {
    const body = await request.json();

    // Hash the password
    const password = body.password ? hashPassword(body.password) : null;
    // Get the user using the provided info
    try {
        const user = await User.getByEmail(body.email, password);
        // If this is a new device for the user, add to the device list
        if (body.device && !user.containsDevice(body.device)) {
            user.devices.push(body.device);
            await user.save();
        }
        // generate a new token for the user
        // the token is used to authenticate with the WebSocket server and expires within 1 hour
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
