/*
** app/sleeper/[userId]/[leagueId]/page.tsx
*/

import { getNflState } from "../../api";
import { getLeagueStats, userIdToName } from "../../utils";

import Header from "@/components/Header";
import GameStatView from "./components/GameStatView";
import StatsListView from "./components/StatsListView";

import styles from "./page.module.css";

interface WinPercentage {
    name: string;
    wins: number;
    losses: number;
    winPct: number;
    pointsFor: number;
}

interface Points {
    name: string;
    points: number;
}

interface Trades {
    name: string;
    trades: number;
}

interface Transactions {
    name: string;
    transactions: number;
}

interface FAAB {
    name: string;
    faab: number;
}

interface SleeperLeagueProps {
    params: Promise<{ userId: string; leagueId: string }>;
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function SleeperUser({ params }: SleeperLeagueProps) {
    const { leagueId } = await params;

    const nflState = await getNflState();
    const info = await getLeagueStats(leagueId, nflState);
    const leagueName = info.league[nflState.season].name;

    /*
    ** win percentage
    */
    const winPctHeaders = ["Name", "W", "L", "Pct"];
    const winPct: WinPercentage[] = [];
    for (const [userID, stats] of Object.entries(info.matchups.users)) {
        winPct.push({
            name: userIdToName(info.users, userID)!,
            wins: stats.wins,
            losses: stats.losses,
            winPct: (stats.wins / (stats.wins + stats.losses)) * 100,
            pointsFor: stats.pointsFor,  // used as a tiebreaker
        });
    }
    // reverse-sort to get descending order
    winPct.sort((a, b) => {
        if (a.wins == b.wins) {
            // use points_for to break ties
            return a.pointsFor - b.pointsFor;
        } else {
            return a.wins - b.wins;
        }
    }).reverse();
    // transform into the expected StatsListView format
    const winPctEntries = winPct.map((o) => (
        [o.name, o.wins.toString(), o.losses.toString(), `${o.winPct.toFixed(1)}%`]
    ));

    /*
    ** points scored
    */
    const pointsScoredHeaders = ["Name", "PF"];
    const pointsScored: Points[] = [];
    for (const [userID, stats] of Object.entries(info.matchups.users)) {
        pointsScored.push({
            name: userIdToName(info.users, userID)!,
            points: stats.pointsFor,
        });
    }
    // reverse-sort to get descending order
    pointsScored.sort((a, b) => a.points - b.points).reverse();
    const pointsScoredEntries = pointsScored.map((o) => [o.name, o.points.toFixed(2)]);

    /*
    ** points against
    */
    const pointsAgainstHeaders = ["Name", "PA"];
    const pointsAgainst: Points[] = [];
    for (const [userID, stats] of Object.entries(info.matchups.users)) {
        pointsAgainst.push({
            name: userIdToName(info.users, userID)!,
            points: stats.pointsAgainst,
        });
    }
    pointsAgainst.sort((a, b) => a.points - b.points);
    const pointsAgainstEntries = pointsAgainst.map((o) => [o.name, o.points.toFixed(2)]);

    /*
    ** bench points
    */
    const benchPointsHeaders = ["Name", "Pts"];
    const benchPoints: Points[] = [];
    for (const [userID, stats] of Object.entries(info.matchups.users)) {
        benchPoints.push({
            name: userIdToName(info.users, userID)!,
            points: stats.benchPoints,
        });
    }
    // reverse-sort to get descending order
    benchPoints.sort((a, b) => a.points - b.points).reverse();
    const benchPointsEntries = benchPoints.map((o) => [o.name, o.points.toFixed(2)]);

    /*
    ** trades completed
    */
    const tradesCompletedHeaders = ["Name", "Trades"];
    const tradesCompleted: Trades[] = [];
    for (const [userID, stats] of Object.entries(info.transactions)) {
        tradesCompleted.push({
            name: userIdToName(info.users, userID)!,
            trades: stats.tradesCompleted,
        });
    }
    // reverse-sort to get descending order
    tradesCompleted.sort((a, b) => a.trades - b.trades).reverse();
    const tradesCompletedEntries = tradesCompleted.map((o) => [o.name, o.trades.toString()]);

    /*
    ** player transactions
    */
    const transactionsHeaders = ["Name", "Txns"];
    const transactions: Transactions[] = [];
    for (const [userID, stats] of Object.entries(info.transactions)) {
        transactions.push({
            name: userIdToName(info.users, userID)!,
            transactions: stats.playerTransactions,
        });
    }
    // reverse-sort to get descending order
    transactions.sort((a, b) => a.transactions - b.transactions).reverse();
    const transactionsEntries = transactions.map((o) => [o.name, o.transactions.toString()]);

    /*
    ** FAAB spent
    */
    const faabSpentHeaders = ["Name", "FAAB"];
    const faabSpent: FAAB[] = [];
    for (const [userID, stats] of Object.entries(info.transactions)) {
        faabSpent.push({
            name: userIdToName(info.users, userID)!,
            faab: stats.faabSpent,
        });
    }
    // reverse-sort to get descending order
    faabSpent.sort((a, b) => a.faab - b.faab).reverse();
    const faabSpentEntries = faabSpent.map((o) => [o.name, `$${o.faab}`]);

    return (
        <section className={styles.leagueWrapper}>
            <Header text={leagueName} />
            <div className={styles.statsWrapper}>
                <GameStatView
                    info={info}
                    title="Most Points"
                    game={info.matchups.maxScore}
                    boldWinner={true}
                />
                <GameStatView
                    info={info}
                    title="Least Points"
                    game={info.matchups.minScore}
                    boldLoser={true}
                />
                <GameStatView
                    info={info}
                    title="Biggest Blowout"
                    game={info.matchups.biggestBlowout}
                />
                <GameStatView
                    info={info}
                    title="Closest Game"
                    game={info.matchups.closestGame}
                />
                <div className={styles.gridBreak} />
                <StatsListView
                    title="Win Percentage"
                    headers={winPctHeaders}
                    entries={winPctEntries}
                />
                <StatsListView
                    title="Total Points Scored"
                    headers={pointsScoredHeaders}
                    entries={pointsScoredEntries}
                />
                <StatsListView
                    title="Total Points Against"
                    headers={pointsAgainstHeaders}
                    entries={pointsAgainstEntries}
                />
                <StatsListView
                    title="Total Bench Points"
                    headers={benchPointsHeaders}
                    entries={benchPointsEntries}
                />
                <StatsListView
                    title="Total Trades Completed"
                    headers={tradesCompletedHeaders}
                    entries={tradesCompletedEntries}
                />
                <StatsListView
                    title="Total FA/Waiver Moves"
                    headers={transactionsHeaders}
                    entries={transactionsEntries}
                />
                <StatsListView
                    title="Total FAAB Spent"
                    headers={faabSpentHeaders}
                    entries={faabSpentEntries}
                />
            </div>
        </section>
    );
}
