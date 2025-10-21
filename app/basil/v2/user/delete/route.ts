/*
** app/basil/v2/user/delete/route.ts
*/

import { NextRequest, NextResponse } from "next/server";

import User from "@/lib/models/basil/User";
import { hashPassword } from "@/lib/models/basil/utils";

export async function POST(request: NextRequest) {
    const body = await request.json();

    // Hash the password
    const password = body.password ? hashPassword(body.password) : null;
    // Retrieve the user matching the provided info and delete it
    try {
        const user = await User.getByEmail(body.email, password);
        await user.deleteOne();
        return new NextResponse();
    } catch(err) {
        const message = (err as Error).message;
        return NextResponse.json(null, { status: 400, statusText: message });
    }
}
