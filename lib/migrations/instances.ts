/*
** lib/migrations/instances.ts
*/

import UserMigration from "./basil/User";

const migrations: Migration[] = [
    new UserMigration(),
];

export default migrations;
