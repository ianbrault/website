/*
** lib/db/base.ts
*/

import { Collection, Document, ObjectId } from "mongodb";

export interface InterfaceBase extends Document {
    _id: ObjectId;
    schemaVersion: number;
}

export class ModelBase<Interface extends InterfaceBase> {
    data: Interface;

    constructor(data: Interface) {
        this.data = data;
    }

    get id(): ObjectId {
        return this.data._id;
    }
}

export class ManagerBase<Interface extends InterfaceBase> {
    collection: Collection<Interface>;

    constructor(collection: Collection<Interface>) {
        this.collection = collection;
    }
}

export abstract class Migration {
    abstract migrate(): Promise<void>;
}

export function validate(o: object) {
    for (const [key, value] of Object.entries(o)) {
        if (value === undefined) {
            throw new Error(`Missing ${key}.`);
        }
    }
}
