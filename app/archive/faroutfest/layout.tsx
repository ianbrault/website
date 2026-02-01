/*
** app/arhcive/faroutfest/layout.tsx
*/

import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
    title: "Far Out Fest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}


