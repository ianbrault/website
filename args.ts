/*
** args.ts
*/

import { info } from "./utils/log.ts";

export interface Args {
    nightly: boolean;
}

function contains(args: string[], arg: string): boolean {
    return args.find((a) => a === arg) !== undefined;
}

export function parseArgs(args: string[]): Args {
    args.forEach((arg) => info(arg));
    if (contains(args, "-h") || contains(args, "--help")) {
        info("usage: main.ts [--nightly] [-h]");
        process.exit(0);
    }
    return {
        nightly: contains(args, "--nightly"),
    }
}
