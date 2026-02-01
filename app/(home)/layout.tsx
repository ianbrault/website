/*
** app/(home)/layout.tsx
*/

import type { Metadata } from "next";

import VFlex from "@/components/VFlex";

import "../globals.css";

export const metadata: Metadata = {
    title: "Ian Brault",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en">
            <body>
                <VFlex
                    style={{
                        maxWidth: "70ch",
                        width: "fit-content",
                        padding: "4em 0",
                        margin: "auto",
                    }}
                    gap={28}
                >
                    {children}
                </VFlex>
            </body>
        </html>
    );
}
