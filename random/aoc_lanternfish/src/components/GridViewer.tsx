/*
** random/aoc_lanternfish/src/components/GridViewer.tsx
*/

import React from "react";

import Button from "../../../../components/Button.tsx";

import "../styles/GridViewer.css";

interface GridViewerProps {
    contents: string[][];
}

export default function GridViewer({ contents }: GridViewerProps) {
    const [index, setIndex] = React.useState(0);

    function directionString(direction: string): string | undefined {
        if (direction === "^") {
            return "north";
        } else if (direction === "v") {
            return "south";
        } else if (direction === ">") {
            return "east";
        } else if (direction === "<") {
            return "west";
        } else {
            return "none";
        }
    }

    function onPreviousButton() {
        if (index > 0) {
            setIndex(index - 1);
        }
    }

    function onNextButton() {
        if (index < contents.length - 1) {
            setIndex(index + 1);
        }
    }

    const row = contents[index];
    const grid = row.slice(1);
    const direction = (index < contents.length - 1) ? contents[index + 1][0] : "";

    const width = 100;
    const height = 50;
    const rows: React.JSX.Element[] = [];
    for (let i = 0; i < height; i++) {
        let string = grid.slice(i * width, (i + 1) * width).join("");
        if (string.includes('@')) {
            let index = string.indexOf('@');
            let string_before = string.slice(0, index);
            let string_after = string.slice(index + 1);
            rows.push(
                <p key={i} className="grid-row">
                    {string_before}
                    <span className="grid-row--robot">@</span>
                    {string_after}
                </p>
            );
        } else {
            rows.push(
                <p key={i} className="grid-row">{string}</p>
            );
        }
    }

    return (
        <div className="grid-wrapper">
            <p>direction: {directionString(direction)}</p>
            {rows}
            <div className="grid-control-row">
                <Button message="previous" onClick={onPreviousButton} className="grid-control-row--button"/>
                <p className="grid-control-row--progress">{index + 1}/{contents.length}</p>
                <Button message="next" onClick={onNextButton} className="grid-control-row--button"/>
            </div>
        </div>
    );
}
