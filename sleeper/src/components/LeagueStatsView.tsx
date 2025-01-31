/*
** sleeper/src/components/LeagueStatsView.tsx
*/

import React from "react";

import { Info, userIdToName } from "../utils.ts";

import GameStatView from "./GameStatView.tsx";
import StatsListView from "./StatsListView.tsx";

import "../styles/LeagueStatsView.css";

interface LeagueStatsViewProps {
    info: Info;
}

export default function LeagueStatsView({ info }: LeagueStatsViewProps) {
    const currentYear = new Date().getFullYear();
    const leagueName = info.league[currentYear].name;

    /*
    ** win percentage
    */
    const winPctHeaders = ["Name", "W", "L", "Pct"];
    const winPct: any[] = [];
    for (const [userID, stats] of Object.entries(info.matchups.users)) {
        winPct.push({
            name: userIdToName(info.users, userID),
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
        [o.name, o.wins, o.losses, `${o.winPct.toFixed(1)}%`]
    ));

    /*
    ** points scored
    */
    const pointsScoredHeaders = ["Name", "PF"];
    const pointsScored: any[] = [];
    for (const [userID, stats] of Object.entries(info.matchups.users)) {
        pointsScored.push({
            name: userIdToName(info.users, userID),
            pointsFor: stats.pointsFor,
        });
    }
    // reverse-sort to get descending order
    pointsScored.sort((a, b) => a.pointsFor - b.pointsFor).reverse();
    const pointsScoredEntries = pointsScored.map((o) => (
        [o.name, o.pointsFor.toFixed(2)]
    ));

    /*
    ** points against
    */
    const pointsAgainstHeaders = ["Name", "PA"];
    const pointsAgainst: any[] = [];
    for (const [userID, stats] of Object.entries(info.matchups.users)) {
        pointsAgainst.push({
            name: userIdToName(info.users, userID),
            pointsAgainst: stats.pointsAgainst,
        });
    }
    pointsAgainst.sort((a, b) => a.pointsAgainst - b.pointsAgainst);
    const pointsAgainstEntries = pointsAgainst.map((o) => (
        [o.name, o.pointsAgainst.toFixed(2)]
    ));

    /*
    ** bench points
    */
    const benchPointsHeaders = ["Name", "Pts"];
    const benchPoints: any[] = [];
    for (const [userID, stats] of Object.entries(info.matchups.users)) {
        benchPoints.push({
            name: userIdToName(info.users, userID),
            benchPoints: stats.benchPoints,
        });
    }
    // reverse-sort to get descending order
    benchPoints.sort((a, b) => a.benchPoints - b.benchPoints).reverse();
    const benchPointsEntries = benchPoints.map((o) => (
        [o.name, o.benchPoints.toFixed(2)]
    ));

    /*
    ** trades completed
    */
    const tradesCompletedHeaders = ["Name", "Trades"];
    const tradesCompleted: any[] = [];
    for (const [userID, stats] of Object.entries(info.transactions)) {
        tradesCompleted.push({
            name: userIdToName(info.users, userID),
            tradesCompleted: stats.tradesCompleted,
        });
    }
    // reverse-sort to get descending order
    tradesCompleted.sort((a, b) => a.tradesCompleted - b.tradesCompleted).reverse();
    const tradesCompletedEntries = tradesCompleted.map((o) => [o.name, o.tradesCompleted]);

    /*
    ** player transactions
    */
    const transactionsHeaders = ["Name", "Txns"];
    const transactions: any[] = [];
    for (const [userID, stats] of Object.entries(info.transactions)) {
        transactions.push({
            name: userIdToName(info.users, userID),
            transactions: stats.playerTransactions,
        });
    }
    // reverse-sort to get descending order
    transactions.sort((a, b) => a.transactions - b.transactions).reverse();
    const transactionsEntries = transactions.map((o) => [o.name, o.transactions]);

    /*
    ** FAAB spent
    */
    const faabSpentHeaders = ["Name", "FAAB"];
    const faabSpent: any[] = [];
    for (const [userID, stats] of Object.entries(info.transactions)) {
        faabSpent.push({
            name: userIdToName(info.users, userID),
            faabSpent: stats.faabSpent,
        });
    }
    // reverse-sort to get descending order
    faabSpent.sort((a, b) => a.faabSpent - b.faabSpent).reverse();
    const faabSpentEntries = faabSpent.map((o) => [o.name, `$${o.faabSpent}`]);

    return (
        <section className="league-stats-wrapper">
            <p className="title">{leagueName}</p>
            <div className="stats-views-wrapper">
                <GameStatView
                    info={info}
                    title="MOST POINTS"
                    game={info.matchups.maxScore}
                    boldWinner={true}
                />
                <GameStatView
                    info={info}
                    title="LEAST POINTS"
                    game={info.matchups.minScore}
                    boldLoser={true}
                />
                <GameStatView
                    info={info}
                    title="BIGGEST BLOWOUT"
                    game={info.matchups.biggestBlowout}
                />
                <GameStatView
                    info={info}
                    title="CLOSEST GAME"
                    game={info.matchups.closestGame}
                />
                <div className="grid-break"/>
                <StatsListView
                    title="WIN PERCENTAGE"
                    headers={winPctHeaders}
                    entries={winPctEntries}
                />
                <StatsListView
                    title="TOTAL POINTS SCORED"
                    headers={pointsScoredHeaders}
                    entries={pointsScoredEntries}
                />
                <StatsListView
                    title="TOTAL POINTS AGAINST"
                    headers={pointsAgainstHeaders}
                    entries={pointsAgainstEntries}
                />
                <StatsListView
                    title="TOTAL BENCH POINTS"
                    headers={benchPointsHeaders}
                    entries={benchPointsEntries}
                />
                <StatsListView
                    title="TOTAL TRADES COMPLETED"
                    headers={tradesCompletedHeaders}
                    entries={tradesCompletedEntries}
                />
                <StatsListView
                    title="TOTAL FA/WAIVER MOVES"
                    headers={transactionsHeaders}
                    entries={transactionsEntries}
                />
                <StatsListView
                    title="TOTAL FAAB SPENT"
                    headers={faabSpentHeaders}
                    entries={faabSpentEntries}
                />
            </div>
        </section>
    );
}
