/*
** basil/server/server.ts
*/

import { UUID } from "crypto";
import http from "http";
import { WebSocket, WebSocketServer } from "ws";

import Connection, { ConnectionState } from "./connection.ts";
import Message, { AuthenticationRequestBody, MessageType } from "./message.ts";

import Token from "../models/Token.ts";
import User from "../models/User.ts";
import { debug, error, info } from "../../utils/log.ts";

export default class BasilWSServer {
    private wss: WebSocketServer;
    private connections: {[key: UUID]: Connection};
    private static port: number = 4040;

    constructor() {
        this.wss = new WebSocketServer(
            {port: BasilWSServer.port},
            () => info(`Basil WebSocket server running on wss://localhost:${BasilWSServer.port}`)
        );
        this.connections = {};
        this.wss.on("connection", (ws, req) => this.onConnection(ws, req));
        this.wss.on("error", (err) => this.onServerError(err));
    }

    async onConnection(ws: WebSocket, req: http.IncomingMessage) {
        if (!req.url) {
            ws.close(1008, "Missing URL");
            return;
        }
        const url = new URL(`ws://localhost${req.url}`);
        info(`basil: client connected: ${url.pathname}`);
        // only accept connections for /basil
        if (url.pathname !== "/basil") {
            error(`basil: invalid URL path: ${url.pathname}`);
            ws.close(1008, `Invalid URL: ${url.pathname}`);
            return;
        }

        // Track the connection
        let connection = new Connection(ws);
        this.connections[connection.id] = connection;
        // Terminate the connection if the user does not authenticate in the defined timeout period
        setTimeout(() => {
            if (connection.state == ConnectionState.NeedsAuthentication) {
                debug(`basil: connection ${connection.id} unauthenticated after ` +
                      `${Connection.timeout}s timeout, terminating`);
                ws.close(1001, "Authentication timeout");
                delete this.connections[connection.id];
            }
        }, Connection.timeout);
        // Configure handlers
        ws.on("close", (code, reason) => {
            this.onWebSocketClose(connection.id, code, reason);
        });
        ws.on("error", (err) => {
            this.onWebSocketError(connection.id, err);
        });
        ws.on("message", (data, isBinary) => {
            this.onWebSocketMessage(connection.id, data, isBinary);
        });
    }

    onServerError(err: Error) {
        error(`basil: WebSocket server error: ${err.message}`);
    }

    onWebSocketClose(id: UUID, code: Number, reason: Buffer) {
        info(`basil: connection ${id} closed: ${code}: ${reason.toString()}`);
        delete this.connections[id];
    }

    onWebSocketError(id: UUID, err: Error) {
        // FIXME: unimplemented
        error(`WebSocket error: ${err.message}`);
    }

    async onWebSocketMessage(id: UUID, data: ArrayBuffer | Blob | Buffer | Buffer[], isBinary: Boolean) {
        const connection = this.connections[id];

        // Messages must be in binary format
        if (!isBinary) {
            error(`basil: connection ${id} received non-binary message, terminating`);
            connection?.socket.close(1003, "Data must be binary");
            delete this.connections[id];
            return;
        }

        // Parse the message
        try {
            const message = await Message.parse(data);
            switch (message.type) {
            case MessageType.AuthenticationRequest:
                await this.authenticationRequestHandler(connection, message.body as AuthenticationRequestBody);
                break;
            }
        } catch (err) {
            // Invalid message, terminate connection
            error(`basil: connection ${id} received invalid message: ${err.message}`);
            connection?.socket.close(1007, err.message);
            delete this.connections[id];
        }
    }

    async authenticationRequestHandler(connection: Connection, body: AuthenticationRequestBody) {
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
            // User authenticated successfully
            connection.state = ConnectionState.Authenticated;
            connection.userId = user.id;
            const message = new Message(MessageType.Success, null);
            connection.socket.send(message.serialize());
        } catch (err) {
            error(`basil: connection ${connection.id} authentication failure: ${err.message}`);
            // Send an error message back to the client
            const message = new Message(MessageType.AuthenticationError, err.message);
            connection.socket.send(message.serialize());
        }
    }
}
