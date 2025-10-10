/*
** app/archive/bbash18-teaser/layout.tsx
*/

import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
    title: "Bruin Bash 2018",
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

