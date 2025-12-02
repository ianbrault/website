/*
** lib/basil/models/Token.ts
*/

import { ObjectId } from "mongodb";
import { InterfaceBase, ManagerBase, ModelBase } from "@/lib/db/base";

const SCHEMA_VERSION = 0;
const EXPIRATION = 3600 * 1000;  // 1 hour

export interface Interface extends InterfaceBase {
    user: ObjectId;
    expiration: Date;
}

export class Model extends ModelBase<Interface> {
    get user(): ObjectId {
        return this.data.user;
    }

    get expiration(): Date {
        return this.data.expiration;
    }
}

export class Manager extends ManagerBase<Interface> {
    async find(id: string | ObjectId | undefined): Promise<Model> {
        const token = await this.collection.findOne({ _id: new ObjectId(id) });
        if (!token) {
            throw new Error(`Invalid token ID ${id}`);
        }
        return new Model(token);
    }

    async create(user: ObjectId): Promise<Model> {
        // Issue the token so that it expires in 1 hour
        const expiration = new Date();
        expiration.setTime(expiration.getTime() + EXPIRATION);

        const token = {
            _id: new ObjectId(),
            schemaVersion: SCHEMA_VERSION,
            user: user,
            expiration: expiration,
        };
        const result = await this.collection.insertOne(token);
        console.debug(`Created token ${result?.insertedId}`);
        return new Model(token);
    }
}
