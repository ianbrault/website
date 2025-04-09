/*
** basil/migrations/User.ts
*/

import { HydratedDocument } from "mongoose";

import User, { IUser } from "../models/User.ts";
import { info } from "../../utils/log.ts";

export default class UserMigration {
    static applyMigration(user: HydratedDocument<IUser>): boolean {
        // Migration 0: Add field "schemaVersion"
        if (user.schemaVersion === undefined) {
            user.schemaVersion = 0;
            this.applyMigration(user);
            return true;
        }
        return false;
    }

    static async migrate(): Promise<void> {
        // Query all users and apply migrations, where applicable
        let users = await User.find({});
        let migrated: HydratedDocument<IUser>[] = [];
        for (const user of users) {
            if (this.applyMigration(user)) {
                migrated.push(user);
            }
        }
        // If migrations were made, save the modified models
        if (migrated.length > 0) {
            await Promise.all(migrated.map((user) => user.save()));
            info(`migrated ${migrated.length} User documents`);
        }
    }
}
