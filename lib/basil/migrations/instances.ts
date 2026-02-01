/*
** lib/migrations/instances.ts
*/

import { Migration } from "@/lib/db/base";
import UserMigration from "./User";

const migrations: Migration[] = [
    new UserMigration(),
];

export default migrations;
