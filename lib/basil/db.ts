/*
** lib/basil/db.ts
*/

import { Collection, Db, Document, MongoClient } from "mongodb";

import migrations from "./migrations/instances";
import * as Token from "./models/Token";
import * as User from "./models/User";

class BasilDBDriver {
    client: MongoClient;
    db: Db;
    tokens: Token.Manager;
    users: User.Manager;

    constructor() {
        const url = process.env.MONGODB_URL;
        if (url == undefined) {
            throw new Error("Missing environment variable MONGODB_URL");
        }
        this.client = new MongoClient(url);
    }

    private async collectionExists(name: string): Promise<boolean> {
        const names = this.db.listCollections({}, { nameOnly: true });
        for await (const collection of names) {
            if (collection.name == name) {
                return true;
            }
        }
        return false;
    }

    private async collection<Interface extends Document>(name: string): Promise<Collection<Interface>> {
        if (await this.collectionExists(name)) {
            return this.db.collection<Interface>(name);
        }
        return await this.db.createCollection<Interface>(name);
    }

    async connect() {
        await this.client.connect();
        console.debug(`Connected to database: ${process.env.MONGODB_URL}`);

        this.db = this.client.db("basil");

        this.tokens = new Token.Manager(await this.collection<Token.Interface>("Token"));
        this.users = new User.Manager(await this.collection<User.Interface>("User"));

        // Apply any migrations once connected
        for (const migration of migrations) {
            await migration.migrate();
        }
    }
}

export default class BasilDB {
    private static driver: BasilDBDriver;

    static isInitialized(): boolean {
        return this.driver !== undefined;
    }

    static async getDriver(): Promise<BasilDBDriver> {
        if (this.isInitialized()) {
            return this.driver;
        }
        this.driver = new BasilDBDriver();
        await this.driver.connect();
        return this.driver;
    }
}
