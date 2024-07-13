/*
** sleeper/src/components/StatsListView.tsx
*/

import React from "react";

import "../styles/StatsListView.css";

interface StatsListViewProps {
    title: string;
    headers: string[];
    entries: string[][];
}

export default function StatsListView({ title, headers, entries }: StatsListViewProps) {
    const gridLayout = {
        gridTemplateColumns: `repeat(${headers.length + 1}, auto)`,
        gridTemplateRows: `repeat(${entries.length + 1}, auto)`,
    };

    let key = 0;
    const items: React.ReactElement[] = [];
    items.push(<p key={key++} className="grid-header">#</p>);
    headers.forEach((header) => {
        items.push(<p key={key++} className="grid-header">{header}</p>);
    });
    entries.forEach((entry, i) => {
        items.push(<p key={key++} className="grid-item-index">{i + 1}</p>);
        entry.forEach((field, j) => {
            const className = j == 0 ? "grid-item-name" : "grid-item";
            items.push(<p key={key++} className={className}>{field}</p>);
        });
    });

    return (
        <div className="stats-list-wrapper">
            <p className="stats-list-title">{title}</p>
            <div className="stats-list-grid" style={gridLayout}>
                {items}
            </div>
        </div>
    );
}

