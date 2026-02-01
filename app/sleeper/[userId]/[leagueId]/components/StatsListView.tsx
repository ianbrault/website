/*
** app/sleeper/[userId]/[leagueId]/components/StatsListView.tsx
*/

import React from "react";

import styles from "./StatsListView.module.css";

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
    items.push(<p key={key++} className={styles.gridHeader}>#</p>);
    headers.forEach((header) => {
        items.push(<p key={key++} className={styles.gridHeader}>{header}</p>);
    });
    entries.forEach((entry, i) => {
        items.push(<p key={key++} className={styles.gridItemIndex}>{i + 1}</p>);
        entry.forEach((field, j) => {
            const className = (j == 0) ? styles.gridItemName : styles.gridItem;
            items.push(<p key={key++} className={className}>{field}</p>);
        });
    });

    return (
        <div className={styles.statsListWrapper}>
            <p className={styles.statsListTitle}>{title}</p>
            <div className={styles.statsListGrid} style={gridLayout}>
                {items}
            </div>
        </div>
    );
}
