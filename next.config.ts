/*
** next.config.ts
*/

import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    allowedDevOrigins: [
        "brault.dev",
        "*.brault.dev",
        "test.brault.dev",
        "*.test.brault.dev",
    ],
    reactStrictMode: true,
    images: {
        remotePatterns: [
            new URL("https://*.githubusercontent.com/**"),
        ],
        qualities: [75, 85],
    },
    turbopack: {
        root: path.join(__dirname, "."),
    },
};

export default nextConfig;
