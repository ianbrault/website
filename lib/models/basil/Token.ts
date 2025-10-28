/*
** lib/models/basil/Token.ts
*/

import { model, HydratedDocument, Model, ObjectId, Schema, Types } from "mongoose";

const SCHEMA_VERSION = 0;
const EXPIRATION = 3600 * 1000;  // 1 hour

export interface IToken {
    schemaVersion: number;
    user: Types.ObjectId;
    expiration: Date;
}

export type ITokenMethods = object;

export type TokenDocument = HydratedDocument<IToken, ITokenMethods>;

interface TokenModel extends Model<IToken, object, ITokenMethods> {
    getById(id: string | null): Promise<TokenDocument>;
    issue(user: ObjectId): Promise<TokenDocument>;
}

const tokenSchema = new Schema<IToken, TokenModel, ITokenMethods>({
    schemaVersion: {
        type: Number,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    expiration: Date,
});

tokenSchema.static("getById", async function getById(id: string | null): Promise<TokenDocument> {
    const token = await this.findById(id);
    if (!token) {
        throw new Error(`Invalid token ID ${id}`);
    }
    return token;
});

tokenSchema.static("issue", async function issue(user: ObjectId): Promise<TokenDocument> {
    // issue the token so that it expires in 1 hour
    const expiration = new Date();
    expiration.setTime(expiration.getTime() + EXPIRATION);

    const token = new this({
        schemaVersion: SCHEMA_VERSION,
        user: user,
        expiration: expiration,
    });
    await token.save();
    return token;
});

export default model<IToken, TokenModel>("Token", tokenSchema);
