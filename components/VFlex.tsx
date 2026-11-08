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
    const divStyle = structuredClone(style);
    divStyle.display = "flex";
    divStyle.flexDirection = "column";
    divStyle.alignItems = alignItems;
    divStyle.justifyContent = justifyContent;
    divStyle.gap = gap ? `${gap}px` : undefined;
    return (
        <div className={className} style={divStyle}>
            {children}
        </div>
    );
}
