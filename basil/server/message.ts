/*
** basil/server/message.ts
*/

export const enum MessageType {
    Success               = 200,
    AuthenticationRequest = 201,
    AuthenticationError   = 401,
}

export interface AuthenticationRequestBody {
    userId: string
    token: string
};

type MessageBody = AuthenticationRequestBody | string | null;

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

    private static validateKeys(object: Object, keys: string[]) {
        for (const key of keys) {
            if (!object.hasOwnProperty(key)) {
                throw new ParseError(`Missing key '${key}'`);
            }
        }
    }

    static async parse(data: ArrayBuffer | Blob | Buffer | Buffer[]): Promise<Message> {
        var obj: Object;
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

        // parse the message body using the given type
        Message.validateKeys(obj, ["type", "body"]);
        switch (obj["type"]) {
        case MessageType.AuthenticationRequest:
            Message.validateKeys(obj["body"], ["userId", "token"]);
            const body = {
                userId: obj["body"]["userId"],
                token: obj["body"]["token"],
            };
            return new Message(obj["type"], body);
        default:
            throw new ParseError(`Invalid message type: ${obj["type"]}`);
        }
    }
}
