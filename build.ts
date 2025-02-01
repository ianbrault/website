/*
** build.ts
*/

import * as esbuild from "esbuild";

import { info } from "./utils/log.ts";
import { projectDirectory } from "./utils/path.ts";

export default async function build() {
    info("building scripts...");

    await esbuild.initialize({});
    await esbuild.build({
        absWorkingDir: projectDirectory(),
        entryPoints: [
            "./archive/src/bbash18_teaser.js",
            "./archive/src/faroutfest/faroutfest.js",
            "./archive/src/faroutfest/lineup.js",
            "./archive/src/faroutfest/slideshow.js",
            "./random/aoc_lanternfish/src/index.tsx",
            "./sleeper/src/index.tsx",
        ],
        outdir: "./dist",
        bundle: true,
        format: "esm",
    });
}
