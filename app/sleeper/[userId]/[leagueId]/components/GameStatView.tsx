/*
** app/sleeper/[userId]/[leagueId]/components/GameStatView.tsx
*/

import { Info, GameStats, userIdToName } from "../../../utils";

import styles from "./GameStatView.module.css";

interface GameStatViewProps {
    info: Info;
    title: string;
    game: GameStats;
    boldWinner?: boolean;
    boldLoser?: boolean;
}

export default function GameStatView({ info, title, game, boldWinner = false, boldLoser = false }: GameStatViewProps) {
    const winnerName = userIdToName(info.users, game.winner);
    const loser = (game.winner == game.teamA.userID) ? game.teamB.userID : game.teamA.userID;
    const loserName = userIdToName(info.users, loser);
    const weekDescription = `${game.year} week ${game.week + 1}`;

    return (
        <div className={styles.statWrapper}>
            <p className={styles.statTitle}>{title}</p>
            <div className={styles.statGrid}>
                <p className={boldWinner ? styles.gridBold : ""}>{winnerName}</p>
                <p className={boldWinner ? styles.gridBold : ""}>{game.winnerScore.toFixed(2)}</p>
                <p className={boldLoser ? styles.gridBold : ""}>{loserName}</p>
                <p className={boldLoser ? styles.gridBold : ""}>{game.loserScore.toFixed(2)}</p>
                <p>{weekDescription}</p>
            </div>
        </div>
    );
}
