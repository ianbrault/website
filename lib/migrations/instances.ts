/*
** lib/migrations/instances.ts
*/

import Migration from "./base";
import UserMigration from "./basil/User";

const migrations: Migration[] = [
    new UserMigration(),
];

export default migrations;
