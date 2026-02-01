/*
** basil/server/server.ts
*/

import { UUID } from "crypto";
import http from "http";
import { ObjectId } from "mongodb";
import { WebSocket, WebSocketServer } from "ws";

import Connection, { ConnectionState } from "./Connection";
import Message, { AuthenticationRequestBody, MessageType, NotifyRequestBody, UpdateRequestBody } from "./Message";

import BasilDB from "@/lib/basil/db";

export default class BasilWSServer {
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

    async onConnection(ws: WebSocket, _: http.IncomingMessage) { // eslint-disable-line @typescript-eslint/no-unused-vars
        // Track the connection
        const connection = new Connection(ws);
        this.connections[connection.id] = connection;
        console.info(`client connected: ${connection.id}`);

        // Terminate the connection if the user does not authenticate in the defined timeout period
        setTimeout(() => {
            if (connection.state == ConnectionState.NeedsAuthentication) {
                console.debug(
                    `Connection ${connection.id} unauthenticated after ${Connection.timeout}ms, terminating`
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
        console.error(`WebSocket server error: ${err.message}`);
    }

    onWebSocketClose(id: UUID, code: number, reason: Buffer) {
        console.info(`Connection ${id} closed: ${code}: ${reason.toString()}`);
        delete this.connections[id];
    }

    onWebSocketError(id: UUID, err: Error) {
        // TODO: consider disconnecting the client if an error occurs
        console.error(`connection ${id} error: ${err.message}`);
    }

    async onWebSocketMessage(id: UUID, data: ArrayBuffer | Blob | Buffer | Buffer[], isBinary: boolean) {
        const connection = this.connections[id];

        // Messages must be in binary format
        if (!isBinary) {
            console.error(`Connection ${id} received non-binary message, terminating`);
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
            case MessageType.NotifyRequest:
                await this.notifyRequestHandler(connection, message.body as NotifyRequestBody);
                break;
            }
        } catch (err) {
            const error_message = (err as Error).message;
            // Invalid message, terminate connection
            console.error(`Connection ${id} received invalid message: ${error_message}`);
            connection?.socket.close(1007, error_message);
            delete this.connections[id];
        }
    }

    async authenticationRequestHandler(connection: Connection, body: AuthenticationRequestBody) {
        const db = await BasilDB.getDriver();
        try {
            const user = await db.users.find(body.userId);
            const token = await db.tokens.find(body.token);
            // Verify that the token is valid for the user
            if (!token.user.equals(user.id)) {
                throw new Error(`Token does not match for user ${body.userId}`);
            }
            // Verify that the token has not expired
            const now = new Date();
            if (now > token.expiration) {
                throw new Error(`Token expired at ${token.expiration.toUTCString()}`);
            }
            // User authenticated successfully
            console.info(`Connection ${connection.id} authenticated user ${user.email}`);
            connection.state = ConnectionState.Authenticated;
            connection.userId = user.id;
            const message = new Message(MessageType.Success, null);
            connection.send(message);
        } catch (err) {
            const error_message = (err as Error).message;
            console.error(`Connection ${connection.id} authentication failure: ${error_message}`);
            // Send an error message back to the client
            const message = new Message(MessageType.AuthenticationError, error_message);
            connection.send(message);
        }
    }

    async updateRequestHandler(connection: Connection, body: UpdateRequestBody) {
        // User must be authenticated
        if (connection.state != ConnectionState.Authenticated) {
            console.error(
                `Connection ${connection.id} update request received while unauthenticated, terminating`
            );
            connection?.socket.close(1008, "Connection not authenticated");
            delete this.connections[connection.id];
            return;
        }

        const db = await BasilDB.getDriver();
        try {
            const user = await db.users.find(connection.userId);
            user.root = body.root;
            user.recipes = body.recipes;
            user.folders = body.folders;
            await db.users.update(user);
            // User updated successfully
            console.info(`Connection ${connection.id} updated user ${user.email}`);
            const message = new Message(MessageType.Success, null);
            connection.send(message);
            // Notify any other connected clients that an update was made
            await this.notifyClients(user.id, [connection.id]);
        } catch (err) {
            const error_message = (err as Error).message;
            console.error(`Connection ${connection.id} update failure: ${error_message}`);
            // Send an error message back to the client
            const message = new Message(MessageType.UpdateError, error_message);
            connection.send(message);
        }
    }

    async notifyRequestHandler(connection: Connection, body: NotifyRequestBody) {
        try {
            const userId = new ObjectId(body.userId);
            await this.notifyClients(userId);
            // Users notified successfully
            const message = new Message(MessageType.Success, null);
            connection.send(message);
        } catch (err) {
            const error_message = (err as Error).message;
            // Send an error message back to the client
            const message = new Message(MessageType.UpdateError, error_message);
            connection.send(message);
        }
    }

    async notifyClients(userId: ObjectId, excluding: UUID[] = []) {
        const db = await BasilDB.getDriver();
        const user = await db.users.find(userId);
        const body = {
            root: user.root,
            recipes: user.recipes,
            folders: user.folders,
            sequence: user.sequence,
        };
        const message = new Message(MessageType.SyncRequest, body);
        for (const connection of Object.values(this.connections)) {
            if ((!connection.userId?.equals(userId)) || (excluding.find((id) => id === connection.id))) {
                continue;
            }
            connection.send(message);
        }
    }
}
