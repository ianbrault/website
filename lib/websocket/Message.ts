/*
** basil/server/message.ts
*/

import { Schema } from "mongoose";

export const enum MessageType {
    Success               = 200,
    AuthenticationRequest = 201,
    UpdateRequest         = 202,
    SyncRequest           = 203,
    AuthenticationError   = 401,
    UpdateError           = 402,
}

export interface AuthenticationRequestBody {
    userId: string
    token: string
};

export interface UpdateRequestBody {
    root: string
    recipes: Schema.Types.Mixed
    folders: Schema.Types.Mixed
};

export interface SyncRequestBody {
    root: string
    recipes: Schema.Types.Mixed
    folders: Schema.Types.Mixed
    sequence: number
};

type MessageBody = AuthenticationRequestBody | UpdateRequestBody | SyncRequestBody | string | null;

class ParseError extends Error {}

export default class Message {
    type: MessageType
    body: MessageBody

    constructor(type: MessageType, body: MessageBody) {
        this.type = type
        this.body = body
    }

    serialize(): Buffer {
        const data = {
            type: this.type,
            body: this.body,
        };
        return Buffer.from(JSON.stringify(data));
    }

    private static validateKeys(object: object, keys: string[]) {
        for (const key of keys) {
            if (!object.hasOwnProperty(key)) {
                throw new ParseError(`Missing key '${key}'`);
            }
        }
    }

    static async parse(data: ArrayBuffer | Blob | Buffer | Buffer[]): Promise<Message> {
        let obj: any;  // eslint-disable-line @typescript-eslint/no-explicit-any
        if (data instanceof ArrayBuffer) {
            obj = JSON.parse(new TextDecoder().decode(data));
        } else if (data instanceof Blob) {
            const arrayBuf = await data.arrayBuffer();
            obj = JSON.parse(new TextDecoder().decode(arrayBuf));
        } else if (data instanceof Buffer) {
            obj = JSON.parse(data.toString());
        } else {
            throw new ParseError(`Invalid message type: ${typeof data}`);
        }

        let body: MessageBody;
        // parse the message body using the given type
        Message.validateKeys(obj, ["type", "body"]);
        switch (obj["type"]) {
        case MessageType.AuthenticationRequest:
            Message.validateKeys(obj["body"], ["userId", "token"]);
            body = {
                userId: obj["body"]["userId"],
                token: obj["body"]["token"],
            };
            return new Message(obj["type"], body);
        case MessageType.UpdateRequest:
            Message.validateKeys(obj["body"], ["root", "recipes", "folders"]);
            body = {
                root: obj["body"]["root"],
                recipes: obj["body"]["recipes"],
                folders: obj["body"]["folders"],
            };
            return new Message(obj["type"], body);
        default:
            throw new ParseError(`Invalid message type: ${obj["type"]}`);
        }
    }
}
