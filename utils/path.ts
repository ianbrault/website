/*
** utils/path.ts
*/

import * as path from "$std/path/mod.ts";

export function getProjectDirectory(): string {
    const filePath = path.fromFileUrl(import.meta.url);
    return path.dirname(path.dirname(filePath));
}

export function getStaticDirectory(app: string): string {
    const projectDir = getProjectDirectory();
    return path.join(projectDir, app, "static");
}

export function getViewsDirectory(app: string): string {
    const projectDir = getProjectDirectory();
    return path.join(projectDir, app, "views");
}
