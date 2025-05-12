/*
** basil/server/connection.ts
*/

import { UUID } from "crypto";
import { WebSocket } from "ws";

export enum ConnectionState {
    NeedsAuthentication = 0,
    Authenticated       = 1,
}

export default class Connection {
    static timeout = 3600 * 1000;  // 1 hour

    id: UUID
    socket: WebSocket
    state: ConnectionState
    userId: string | undefined

    constructor(socket: WebSocket) {
        this.id = crypto.randomUUID();
        this.socket = socket;
        this.state = ConnectionState.NeedsAuthentication;
        this.userId = undefined;
    }
}
