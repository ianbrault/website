/*
** basil/server/connection.ts
*/

import { UUID } from "crypto";
import { WebSocket } from "ws";

import Message from "./message.ts";
import { debug } from "../../utils/log.ts";

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

    send(message: Message) {
        debug(`basil: connection ${this.id} send message: ${message.type}: ` +
              `${JSON.stringify(message.body)}`);
        this.socket.send(message.serialize());
    }
}
