/*
** components/HFlex.tsx
*/

import React from "react";

interface HFlexProps {
    className?: string;
    alignItems?: string;
    justifyContent?: string;
    gap?: number;
    children?: React.ReactNode;
}

export default function HFlex(
    {className, alignItems = "normal", justifyContent = "flex_start", gap = 0, children}: HFlexProps
) {
    return (
        <div
            className={className}
            style={{
                display: "flex",
                flexDirection: "row",
                alignItems: alignItems,
                justifyContent: justifyContent,
                gap: `${gap}px`,
            }}
        >
            {children}
        </div>
    );
}
