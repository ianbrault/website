/*
** lib/migrations/migrations.d.ts
*/

declare abstract class Migration {
    abstract migrate(): Promise<void>;
}
