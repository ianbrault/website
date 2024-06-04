/*
** utils/path.ts
*/

import * as path from "$std/path/mod.ts";

export function projectDirectory(): string {
    const filePath = path.fromFileUrl(import.meta.url);
    return path.dirname(path.dirname(filePath));
}

export function staticDirectory(app: string): string {
    const projectDir = projectDirectory();
    return path.join(projectDir, app, "static");
}

export function viewsDirectory(app: string): string {
    const projectDir = projectDirectory();
    return path.join(projectDir, app, "views");
}
