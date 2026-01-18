/*
** lib/websocket/client.ts
*/

import { ObjectId } from "mongodb";
import { WebSocket } from "ws";

import Message, { MessageType } from "./Message";

export function notifyClients(userId: ObjectId) {
    const socket = new WebSocket("ws://socket:4000");

    socket.on("open", () => {
        const message = new Message(MessageType.NotifyRequest, {userId: userId.toString()});
        socket.send(message.serialize());
    });

    // Socket handling is a bit haphazard but this should only be called from the update route
    // which is intended for off-nominal CLI uses
    socket.on("message", async (data, isBinary) => {
        // Messages must be in binary format
        if (!isBinary) {
            console.error("Received non-binary message from server");
            return;
        }
        try {
            const message = await Message.parse(data);
            switch (message.type) {
            case MessageType.Success:
                console.debug("Notified clients successfully");
                break;
            default:
                console.error(`Unexpected message type: ${message.type}`);
                break;
            }
        } catch (err) {
            const error_message = (err as Error).message;
            console.error(`Received invalid message: ${error_message}`);
        }
    });
    socket.on("error", (err) => {
        const error_message = (err as Error).message;
        console.error(`Error notifying clients for user ${userId}: ${error_message}`);
    });
}
