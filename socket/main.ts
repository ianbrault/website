/*
** socket/main.ts
*/

import BasilWSServer from "@/lib/websocket/server";

function getSocketPort(): number {
    const port = process.env.PORT;
    if (port == undefined) {
        throw new Error("Missing environment variable PORT");
    }
    return Number(port);
}

async function main() {
    // Create the websocket server
    new BasilWSServer(getSocketPort());
}

(async function() { await main(); })();
