/*
** app/basil/v2/user/delete/route.ts
*/

import { NextRequest, NextResponse } from "next/server";

import BasilDB from "@/lib/basil/db";
import { hashPassword } from "@/lib/utils";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const db = await BasilDB.getDriver();

    // Hash the password
    const password = body.password ? hashPassword(body.password) : undefined;
    // Retrieve the user matching the provided info and delete it
    try {
        const user = await db.users.findWithLogin(body.email, password);
        await db.users.remove(user);
        return new NextResponse();
    } catch(err) {
        const message = (err as Error).message;
        console.error(`basil/v2/user/delete: error: ${message}`);
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
