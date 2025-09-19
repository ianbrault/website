/*
** components/VFlex.tsx
*/

import React from "react";

interface VFlexProps {
    className?: string;
    alignItems?: string;
    justifyContent?: string;
    gap?: number;
    children?: React.ReactNode;
}

export default function VFlex(
    {className, alignItems = "normal", justifyContent = "flex_start", gap = 0, children}: VFlexProps
) {
    return (
        <div
            className={className}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: alignItems,
                justifyContent: justifyContent,
                gap: `${gap}px`,
            }}
        >
            {children}
        </div>
    );
}
