/*
** basil/models/User.ts
*/

import { model, HydratedDocument, Model, Schema, Types } from "mongoose";

const SCHEMA_VERSION = 1;

export interface IUser {
    schemaVersion: Number;
    email: string;
    password: string;
    root: string;
    recipes: Schema.Types.Mixed;
    folders: Schema.Types.Mixed;
    devices: string[];
    // deprecated fields, remove at a later date
    key: string;
}

export interface IUserInfo {
    id: Types.ObjectId;
    email: string;
    root: string;
    recipes: Schema.Types.Mixed;
    folders: Schema.Types.Mixed;
    // deprecated fields, remove at a later date
    key: string;
}

export interface IUserMethods {
    info(): IUserInfo;  // TODO: remove with v1 deprecation
    containsDevice(device: string): boolean;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;

interface UserModel extends Model<IUser, {}, IUserMethods> {
    createUser(
        email: string | null,
        password: string | null,
        root: string | null,
        recipes: Schema.Types.Mixed,
        folders: Schema.Types.Mixed,
        device: string | null,
    ): Promise<UserDocument>;
    getById(id: string | null): Promise<UserDocument>;
    getByEmail(email: string | null, password: string | null): Promise<UserDocument>;
}

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
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
        type: String,
        required: true,
    },
    root: String,
    recipes: Schema.Types.Mixed,
    folders: Schema.Types.Mixed,
    devices: [String],
    // deprecated fields, remove at a later date
    key: String,
});

// TODO: remove with v1 deprecation
userSchema.method("info", function info(): IUserInfo {
    return {
        id: this._id,
        email: this.email,
        root: this.root,
        recipes: this.recipes,
        folders: this.folders,
        key: this.key,
    };
});

userSchema.method("containsDevice", function containsDevice(device: string): boolean {
    return this.devices.find((d) => d === device) !== undefined;
});

userSchema.static("createUser", async function createUser(
    email: string | null,
    password: string | null,
    root: string | null,
    recipes: Schema.Types.Mixed,
    folders: Schema.Types.Mixed,
    device: string | null,
): Promise<UserDocument> {
    // check for a pre-existing user with the same email
    const existing = await this.findOne({email: email});
    if (existing !== null) {
        throw new Error("A user with the given email address already exists.");
    }
    const devices = device ? [device] : [];
    const user = new this({
        schemaVersion: SCHEMA_VERSION,
        email: email,
        password: password,
        root: root,
        recipes: recipes,
        folders: folders,
        devices: devices,
        // deprecated, remove at a later date
        key: crypto.randomUUID().toString().toUpperCase(),
    });
    await user.save();
    return user;
});

userSchema.static("getById", async function getById(id: string | null): Promise<UserDocument> {
    const user = await this.findById(id);
    if (!user) {
        throw new Error(`Invalid user ID ${id}`);
    }
    return user;
});

userSchema.static("getByEmail", async function getByEmail(
    email: string | null,
    password: string | null,
): Promise<UserDocument> {
    // search for the user matching the provided email/password
    const user = await this.findOne({email: email, password: password});
    if (!user) {
        throw new Error(
            "The email address or password you entered is incorrect. Please " +
            "try again."
        );
    }
    return user;
});

export default model<IUser, UserModel>("User", userSchema);
