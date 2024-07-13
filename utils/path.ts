/*
** utils/path.ts
*/

import path from "path";
import url from "url";

export function projectDirectory(): string {
    const filename = url.fileURLToPath(import.meta.url);
    return path.dirname(path.dirname(filename));
}

export function srcDirectory(app: string): string {
    const projectDir = projectDirectory();
    return path.join(projectDir, app, "src");
}

export function staticDirectory(app: string): string {
    const projectDir = projectDirectory();
    return path.join(projectDir, app, "static");
}

export function viewsDirectory(app: string): string {
    const projectDir = projectDirectory();
    return path.join(projectDir, app, "views");
}
