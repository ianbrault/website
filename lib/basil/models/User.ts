/*
** lib/basil/models/User.ts
*/

import { ObjectId } from "mongodb";
import { InterfaceBase, ManagerBase, ModelBase, validate } from "@/lib/db/base";

const SCHEMA_VERSION = 2;

export interface Interface extends InterfaceBase {
    email: string;
    password: string;
    root: string;
    recipes: object[];
    folders: object[];
    devices: string[];
    sequence: number;
}

export class Model extends ModelBase<Interface> {
    get email(): string {
        return this.data.email;
    }

    get root(): string {
        return this.data.root;
    }
    set root(newRoot: string) {
        this.data.root = newRoot;
    }

    get recipes(): object[] {
        return this.data.recipes;
    }
    set recipes(newRecipes: object[]) {
        this.data.recipes = newRecipes;
    }

    get folders(): object[] {
        return this.data.folders;
    }
    set folders(newFolders: object[]) {
        this.data.folders = newFolders;
    }

    get devices(): string[] {
        return this.data.devices;
    }

    get sequence(): number {
        return this.data.sequence;
    }

    containsDevice(device: string): boolean {
        return this.data.devices.find((d) => d === device) !== undefined;
    }
}

export class Manager extends ManagerBase<Interface> {
    async find(id: string | ObjectId | undefined): Promise<Model> {
        const user = await this.collection.findOne({ _id: new ObjectId(id) });
        if (!user) {
            throw new Error(`Invalid user ID ${id}`);
        }
        return new Model(user);
    }

    async findWithLogin(
        email: string | undefined,
        password: string | undefined,
    ): Promise<Model> {
        const user = await this.collection.findOne({ email: email, password: password });
        if (!user) {
            throw new Error(
                "The email address or password you entered is incorrect. Please try again."
            );
        }
        return new Model(user);
    }

    async findAll(): Promise<Model[]> {
        const users = []
        const cursor = this.collection.find();
        for await (const user of cursor ?? []) {
            users.push(new Model(user));
        }
        return users;
    }

    async create(
        email: string | undefined,
        password: string | undefined,
        root: string | undefined,
        recipes: object[],
        folders: object[],
        device: string | undefined,
    ): Promise<Model> {
        // Validate parameters
        validate({
            email: email,
            password: password,
            root: root,
        });
        // Check for a pre-existing user with the same email
        const existing = await this.collection.findOne({ email: email });
        if (existing !== null) {
            throw new Error(`A user with email "${email}" already exists.`);
        }
        const user = {
            _id: new ObjectId(),
            schemaVersion: SCHEMA_VERSION,
            email: email!,
            password: password!,
            root: root!,
            recipes: recipes,
            folders: folders,
            devices: device ? [device] : [],
            sequence: 0,
        };
        const result = await this.collection.insertOne(user);
        console.debug(`Created user ${result?.insertedId}`);
        return new Model(user);
    }

    async update(user: Model) {
        // Update the user and increment its sequence count
        const result = await this.collection.updateOne({ _id: user.id }, {
            $set: {
                email: user.data.email,
                password: user.data.password,
                root: user.data.root,
                recipes: user.data.recipes,
                folders: user.data.folders,
                devices: user.data.devices,
            },
            $inc: {
                sequence: 1,
            }
        });
        if (!result || result?.modifiedCount < 1) {
            throw new Error(`Failed to update user ${user.id}`);
        }
        console.debug(`Updated user ${user.id}`);
    }

    async bulkUpdate(users: Model[]) {
        await Promise.all(
            users.map((user) => this.update(user))
        );
    }

    async remove(user: Model) {
        const result = await this.collection.deleteOne({ _id: user.id });
        if (!result || result?.deletedCount < 1) {
            throw new Error(`Failed to delete user ${user.id}`);
        }
        console.debug(`Deleted user ${user.id}`);
    }
}
