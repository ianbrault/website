/*
** instrumentation.ts
*/

import connect from "@/lib/db";
import { createServer } from "@/lib/websocket/server";

export async function register() {
    // Connect to the MongoDB database
    await connect();
    // Start the Basil WebSocket server
    const port = process.env.WEBSOCKET_PORT;
    if (port == undefined) {
        throw new Error("Missing environment variable WEBSOCKET_PORT");
    }
    createServer(Number(port));
}
