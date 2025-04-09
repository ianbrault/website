/*
** basil/models/User.ts
*/

import { model, Schema, Types } from "mongoose";

export interface IUser {
    schemaVersion: Number;
    email: string;
    password: string;
    key: string;
    root: string;
    recipes: Schema.Types.Mixed;
    folders: Schema.Types.Mixed;
}

export interface IUserInfo {
    id: Types.ObjectId;
    email: string;
    key: string;
    root: string;
    recipes: Schema.Types.Mixed;
    folders: Schema.Types.Mixed;
}

const userSchema = new Schema<IUser>({
    schemaVersion: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,  // base64-encoded
        required: true,
    },
    key: {
        type: String,
        required: true,
    },
    root: String,
    recipes: Schema.Types.Mixed,
    folders: Schema.Types.Mixed,
});

export default model<IUser>("User", userSchema);
