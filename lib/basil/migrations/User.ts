/*
** lib/migrations/basil/User.ts
*/

import BasilDB from "@/lib/basil/db";
import * as User from "@/lib/basil/models/User";
import { Migration } from "@/lib/db/base";

export default class UserMigration extends Migration {
    applyMigration(user: User.Model): boolean {
        // Migration 0: Add field "schemaVersion"
        if (user.data.schemaVersion === undefined) {
            user.data.schemaVersion = 0;
            this.applyMigration(user);
            return true;
        }
        // Migration 1: Add field "devices" for user device tokens
        else if (user.data.schemaVersion === 0) {
            user.data.schemaVersion = 1;
            user.data.devices = [];
            this.applyMigration(user);
            return true;
        }
        // Migration 2: Add field "sequence" for a data version sequence number
        else if (user.data.schemaVersion === 1) {
            user.data.schemaVersion = 2;
            user.data.sequence = 0;
            this.applyMigration(user);
            return true;
        }
        return false;
    }

    async migrate(): Promise<void> {
        const db = await BasilDB.getDriver();
        // Query all users and apply migrations, where applicable
        const users = await db.users.findAll();
        const migrated: User.Model[] = [];
        for (const user of users) {
            if (this.applyMigration(user)) {
                migrated.push(user);
            }
        }
        // If migrations were made, save the modified models
        if (migrated.length > 0) {
            await db.users.bulkUpdate(migrated);
        }
    }
}
