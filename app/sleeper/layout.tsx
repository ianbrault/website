/*
** app/sleeper/layout.tsx
*/

import type { Metadata } from "next";

import "../globals.css";
import "./sleeper.globals.css";

export const metadata: Metadata = {
    title: "Sleeper Stats",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en">
            <body>
                <main>
                    {children}
                </main>
            </body>
        </html>
    );
}
