/*
** random/grid/src/components/GridViewer.tsx
*/

import React from "react";

import "../styles/GridViewer.css";

interface GridViewerProps {
    contents: string[][];
}

export default function GridViewer({ contents }: GridViewerProps) {
    let [hoverRow, setHoverRow] = React.useState<number | undefined>(undefined);
    let [hoverCol, setHoverCol] = React.useState<number | undefined>(undefined);

    let height = contents.length;
    let width = contents[0].length;
    const rowStyle = `repeat(${height}, 1fr)`;
    const colStyle = `repeat(${width}, 1fr)`;

    function onHover(row: number, col: number) {
        setHoverRow(row);
        setHoverCol(col);
    }

    const rows: React.JSX.Element[] = [];
    for (const [i, row] of contents.entries()) {
        for (const [j, col] of row.entries()) {
            rows.push(
                <p key={(i * width) + j} onMouseOver={() => onHover(i, j)} className="grid-item">{col}</p>
            );
        }
    }

    let hoverLabel: React.JSX.Element;
    if (hoverRow !== undefined && hoverCol !== undefined) {
        let text = `${hoverRow},${hoverCol}`;
        hoverLabel = <p className="hover-text">{text}</p>;
    } else {
        hoverLabel = <p className="hover-text--hidden"/>;
    }

    return (
        <>
            {hoverLabel}
            <div
                onMouseLeave={() => {
                    setHoverRow(undefined);
                    setHoverCol(undefined);
                }}
                className="grid-wrapper"
                style={{
                    gridTemplateRows: rowStyle,
                    gridTemplateColumns: colStyle,
                }}
            >
                {rows}
            </div>
        </>
    );
}
