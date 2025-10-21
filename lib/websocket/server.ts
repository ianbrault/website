/*
** basil/server/server.ts
*/

import { UUID } from "crypto";
import http from "http";
import { WebSocket, WebSocketServer } from "ws";

import Connection, { ConnectionState } from "./Connection";
import Message, { AuthenticationRequestBody, MessageType, UpdateRequestBody } from "./Message";

import Token from "@/lib/models/basil/Token";
import User from "@/lib/models/basil/User";

class BasilWSServer {
    private wss: WebSocketServer;
    private connections: {[key: UUID]: Connection};

    constructor(port: number) {
        this.wss = new WebSocketServer(
            {port: port},
            () => console.info(`Basil WebSocket server running on wss://localhost:${port}`)
        );
        this.connections = {};
        this.wss.on("connection", (ws, req) => this.onConnection(ws, req));
        this.wss.on("error", (err) => this.onServerError(err));
    }

    async onConnection(ws: WebSocket, req: http.IncomingMessage) {
        // Track the connection
        let connection = new Connection(ws);
        this.connections[connection.id] = connection;
        console.info(`basil: client connected: ${connection.id}`);

        // Terminate the connection if the user does not authenticate in the defined timeout period
        setTimeout(() => {
            if (connection.state == ConnectionState.NeedsAuthentication) {
                console.debug(
                    `basil: connection ${connection.id} unauthenticated after ${Connection.timeout}ms, terminating`
                );
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
        console.error(`basil: WebSocket server error: ${err.message}`);
    }

    onWebSocketClose(id: UUID, code: Number, reason: Buffer) {
        console.info(`basil: connection ${id} closed: ${code}: ${reason.toString()}`);
        delete this.connections[id];
    }

    onWebSocketError(id: UUID, err: Error) {
        // TODO: consider disconnecting the client if an error occurs
        console.error(`basil: connection ${id} error: ${err.message}`);
    }

    async onWebSocketMessage(id: UUID, data: ArrayBuffer | Blob | Buffer | Buffer[], isBinary: Boolean) {
        const connection = this.connections[id];

        // Messages must be in binary format
        if (!isBinary) {
            console.error(`basil: connection ${id} received non-binary message, terminating`);
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
            case MessageType.UpdateRequest:
                await this.updateRequestHandler(connection, message.body as UpdateRequestBody);
                break;
            }
        } catch (err) {
            const error_message = (err as Error).message;
            // Invalid message, terminate connection
            console.error(`basil: connection ${id} received invalid message: ${error_message}`);
            connection?.socket.close(1007, error_message);
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
            console.info(`basil: connection ${connection.id} authenticated user ${user.email}`);
            connection.state = ConnectionState.Authenticated;
            connection.userId = user.id;
            const message = new Message(MessageType.Success, null);
            connection.send(message);
        } catch (err) {
            const error_message = (err as Error).message;
            console.error(`basil: connection ${connection.id} authentication failure: ${error_message}`);
            // Send an error message back to the client
            const message = new Message(MessageType.AuthenticationError, error_message);
            connection.send(message);
        }
    }

    async updateRequestHandler(connection: Connection, body: UpdateRequestBody) {
        try {
            const user = await User.getById(connection.userId);
            user.root = body.root;
            user.recipes = body.recipes;
            user.folders = body.folders;
            // bump the sequence count
            user.sequence = user.sequence + 1;
            await user.save();
            // User updated successfully
            console.info(`basil: connection ${connection.id} updated user ${user.email}`);
            const message = new Message(MessageType.Success, null);
            connection.send(message);
            // Notify any other connected clients that an update was made
            await this.notifyClients(user.id, [connection.id]);
        } catch (err) {
            const error_message = (err as Error).message;
            console.error(`basil: connection ${connection.id} update failure: ${error_message}`);
            // Send an error message back to the client
            const message = new Message(MessageType.UpdateError, error_message);
            connection.send(message);
        }
    }

    async notifyClients(userId: string, excluding: UUID[] = []) {
        const user = await User.getById(userId);
        const body = {
            root: user.root,
            recipes: user.recipes,
            folders: user.folders,
            sequence: user.sequence,
        };
        const message = new Message(MessageType.SyncRequest, body);
        for (const connection of Object.values(this.connections)) {
            if ((connection.userId !== userId) || (excluding.find((id) => id === connection.id))) {
                continue;
            }
            connection.send(message);
        }
    }
}

export let server: BasilWSServer | undefined = undefined;

export function createServer(port: number) {
    server = new BasilWSServer(port);
}
