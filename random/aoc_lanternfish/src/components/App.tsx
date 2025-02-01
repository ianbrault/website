/*
** random/aoc_lanternfish/src/components/App.tsx
*/

import React from "react";

import FileInput from "./FileInput.tsx";
import GridViewer from "./GridViewer.tsx";

export default function App() {
    const [contents, setContents] = React.useState<string[][]>([]);

    function parseGridContents(fileContents: string): string[][] {
        let rows: string[][] = [];
        for (const row of fileContents.split('\n')) {
            rows.push(row.split(','));
        }
        return rows;
    }

    function onFileSelection(file: File) {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result) {
                let gridContents = parseGridContents(reader.result.toString());
                setContents(gridContents);
            } else {
                alert("Missing file contents. Please try again.");
            }
        };
        reader.onerror = () => {
            alert("Error reading file upload. Please try again.");
        };
        reader.readAsText(file);
    }

    if (contents.length > 0) {
        return (
            <GridViewer contents={contents}/>
        );
    } else {
        return (
            <FileInput
                label="Choose the grid input file:"
                accept=".csv"
                onChange={onFileSelection}
            />
        );
    }
}
