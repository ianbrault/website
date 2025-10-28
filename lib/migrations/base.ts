/*
** lib/migrations/base.ts
*/

export default abstract class Migration {
    abstract migrate(): Promise<void>;
}
