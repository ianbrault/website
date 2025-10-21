/*
** lib/migrations/basil/User.ts
*/

import { HydratedDocument } from "mongoose";
import User, { IUser } from "@/lib/models/basil/User";

export default class UserMigration extends Migration {
    applyMigration(user: HydratedDocument<IUser>): boolean {
        // Migration 0: Add field "schemaVersion"
        if (user.schemaVersion === undefined) {
            user.schemaVersion = 0;
            this.applyMigration(user);
            return true;
        }
        // Migration 1: Add field "devices" for user device tokens
        else if (user.schemaVersion === 0) {
            user.schemaVersion = 1;
            user.devices = [];
            this.applyMigration(user);
            return true;
        }
        // Migration 2: Add field "sequence" for a data version sequence number
        else if (user.schemaVersion === 1) {
            user.schemaVersion = 2;
            user.sequence = 0;
            this.applyMigration(user);
            return true;
        }
        return false;
    }

    async migrate(): Promise<void> {
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
        }
    }
}
