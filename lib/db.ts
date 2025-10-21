/*
** lib/db.ts
*/

import mongoose from "mongoose";

import migrations from "./migrations/instances";

interface Client {
    connection: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
}

let cached: Client = { connection: null, promise: null };

async function connect() {
    if (cached.connection) {
        return cached.connection;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };
        const url = process.env.MONGODB_URL;
        if (url == undefined) {
            throw new Error("Missing environment variable MONGODB_URL");
        }
        cached.promise = mongoose.connect(url, opts);
    }

    cached.connection = await cached.promise;
    // Once connected, apply any migrations
    for (const migration of migrations) {
        await migration.migrate();
    }
    return cached.connection;
}

export default connect;
