/*
** components/VFlex.tsx
*/

import React from "react";

interface VFlexProps {
    className?: string;
    alignItems?: string;
    justifyContent?: string;
    gap?: number;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

export default function VFlex(
    { className, alignItems = "normal", justifyContent = "flex-start", gap = 0, style = {}, children }: VFlexProps
) {
    style.display = "flex";
    style.flexDirection = "column";
    style.alignItems = alignItems;
    style.justifyContent = justifyContent;
    style.gap = gap ? `${gap}px` : undefined;
    return (
        <div className={className} style={style}>
            {children}
        </div>
    );
}
