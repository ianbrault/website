/*
** sleeper/src/components/GameStatView.tsx
*/

import React from "react";

import { Info, GameStats, userIdToName } from "../utils.ts";
import "../styles/GameStatView.css";

interface GameStatViewProps {
    info: Info;
    title: string;
    game: GameStats;
    boldWinner?: boolean;
    boldLoser?: boolean;
}

export default function GameStatView({ info, title, game, boldWinner = false, boldLoser = false }: GameStatViewProps) {
    const winnerName = userIdToName(info.users, game.winner);
    const loser = game.winner == game.teamA.userID ? game.teamB.userID : game.teamA.userID;
    const loserName = userIdToName(info.users, loser);
    const weekDescription = `${game.year} WEEK ${game.week + 1}`;

    return (
        <div className="stat-wrapper">
            <p className="stat-title">{title}</p>
            <div className="stat-grid">
                <p className={boldWinner ? "grid-bold" : ""}>{winnerName}</p>
                <p className={boldWinner ? "grid-bold" : ""}>{game.winnerScore.toFixed(2)}</p>
                <p className={boldLoser ? "grid-bold" : ""}>{loserName}</p>
                <p className={boldLoser ? "grid-bold" : ""}>{game.loserScore.toFixed(2)}</p>
                <p>{weekDescription}</p>
            </div>
        </div>
    );
}
