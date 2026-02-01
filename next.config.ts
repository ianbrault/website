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
    images: {
        remotePatterns: [
            new URL("https://*.githubusercontent.com/**"),
        ],
        qualities: [75, 85, 100],
    },
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    reactStrictMode: true,
    turbopack: {
        root: path.join(__dirname, "."),
    },
};

export default nextConfig;
