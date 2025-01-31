/*
** sleeper/src/utils.ts
*/

import {
    LeagueInfo,
    Matchup,
    Roster,
    Transaction,
    User,
    getLeagueInfo,
    getLeagueMatchups,
    getLeagueRosters,
    getLeagueTransactions,
    getLeagueUsers,
    getNflState,
} from "./api.ts";

export interface GameStats {
    year: number;
    week: number;
    matchupID: number;
    winner: string;
    winnerScore: number;
    loserScore: number;
    teamA: {
        userID: string;
        startersPoints: number;
        benchPoints: number;
    };
    teamB: {
        userID: string;
        startersPoints: number;
        benchPoints: number;
    };
}

namespace GameStats {
    export function empty(): GameStats {
        return {
            year: 0,
            week: 0,
            matchupID: 0,
            winner: "",
            winnerScore: 0,
            loserScore: Number.MAX_VALUE,
            teamA: {
                userID: "",
                startersPoints: 0,
                benchPoints: 0,
            },
            teamB: {
                userID: "",
                startersPoints: 0,
                benchPoints: 0,
            },
        };
    }
}

export interface MatchupStats {
    maxScore: GameStats;
    minScore: GameStats;
    biggestBlowout: GameStats;
    closestGame: GameStats;
    users: {
        [userID: string]: {
            wins: number;
            losses: number;
            pointsFor: number;
            pointsAgainst: number;
            benchPoints: number;
        };
    };
}

export interface UserMatchupStats {
    [userID: string]: {
        [userID: string]: number;
    };
}

export interface TransactionStats {
    [userID: string]: {
        tradesProposed: number;
        tradesCompleted: number;
        playerTransactions: number;
        faabSpent: number;
    };
}

export interface Info {
    games: GameStats[];
    league: {[year: number]: LeagueInfo};
    matchups: MatchupStats;
    rosters: Roster[];
    transactions: TransactionStats;
    users: User[];
    userMatchups: UserMatchupStats;
}

export function userIdToName(users: User[], userID: string): string | undefined {
    const match = users.filter((user) => user.id == userID);
    if (match.length == 1) {
        return match[0].displayName;
    }
}

function rosterIdToUserId(rosters: Roster[], rosterID: number): string {
    return rosters[rosterID - 1].ownerID;
}

function startersPointsTotal(game: Matchup): number {
    return game.startersPoints.reduce((sum, current) => sum + current);
}

function benchPointsTotal(game: Matchup): number {
    let total = 0;
    for (const [player, score] of Object.entries(game.playersPoints)) {
        if (!game.starters.includes(player)) {
            total += score;
        }
    }
    return total;
}

function summarizeGameInfo(
    rosters: Roster[],
    teamA: Matchup,
    teamB: Matchup,
    year: number,
    week: number,
    matchupID: number,
): GameStats {
    const info = GameStats.empty();
    info.year = year;
    info.week = week;
    info.matchupID = matchupID;

    // assign one of the teams to team A and the other to team B
    // gather team A stats
    info.teamA.userID = rosterIdToUserId(rosters, teamA.rosterID);
    info.teamA.startersPoints = startersPointsTotal(teamA);
    info.teamA.benchPoints = benchPointsTotal(teamA);
    // gather team B stats
    info.teamB.userID = rosterIdToUserId(rosters, teamB.rosterID);
    info.teamB.startersPoints = startersPointsTotal(teamB);
    info.teamB.benchPoints = benchPointsTotal(teamB);

    // assign the winner/loser and associated scores
    info.winner = (info.teamA.startersPoints > info.teamB.startersPoints)
        ? info.teamA.userID
        : info.teamB.userID;
    if (info.winner == info.teamA.userID) {
        info.winnerScore = info.teamA.startersPoints;
        info.loserScore = info.teamB.startersPoints;
    } else {
        info.winnerScore = info.teamB.startersPoints;
        info.loserScore = info.teamA.startersPoints;
    }

    return info;
}

function getGameStats(rosters: Roster[], matchups: {[year: number]: Matchup[][]}): GameStats[] {
    const stats: GameStats[] = [];

    // iterate over years in order so that matchups are chronological
    const years = Object.keys(matchups).map((year) => Number(year));
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const nUsers = rosters.length;
    for (let year = minYear; year <= maxYear; year++) {
        for (const [week, teams] of matchups[year].entries()) {
            if (!teams || teams.length === 0) continue;
            // each week contains entries for each team, pair them by matchup ID
            for (let matchupID = 1; matchupID <= nUsers / 2; matchupID++) {
                const games = teams.filter((team) => team.matchupID == matchupID);
                const info = summarizeGameInfo(rosters, games[0], games[1], year, week, matchupID);
                stats.push(info);
            }
        }
    }

    return stats;
}

function getMatchupStats(users: User[], games: GameStats[]): MatchupStats {
    const stats: MatchupStats = {
        maxScore: GameStats.empty(),
        minScore: GameStats.empty(),
        biggestBlowout: GameStats.empty(),
        closestGame: GameStats.empty(),
        users: {},
    };

    stats.biggestBlowout.loserScore = 0;
    stats.closestGame.winnerScore = Number.MAX_VALUE;
    stats.closestGame.loserScore = 0;
    for (const user of users) {
        stats.users[user.id] = {
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            benchPoints: 0,
        };
    }

    // iterate over games info
    for (const game of games) {
        const diff = game.winnerScore - game.loserScore;
        const blowout = stats.biggestBlowout.winnerScore - stats.biggestBlowout.loserScore;
        const closest = stats.closestGame.winnerScore - stats.closestGame.loserScore;
        // assign to user stats for team A
        stats.users[game.teamA.userID].pointsFor += game.teamA.startersPoints;
        stats.users[game.teamA.userID].pointsAgainst += game.teamB.startersPoints;
        stats.users[game.teamA.userID].benchPoints += game.teamA.benchPoints;
        // assign to user stats for team B
        stats.users[game.teamB.userID].pointsFor += game.teamB.startersPoints;
        stats.users[game.teamB.userID].pointsAgainst += game.teamA.startersPoints;
        stats.users[game.teamB.userID].benchPoints += game.teamB.benchPoints;
        // assign winner/loser stats
        const loser = game.winner == game.teamA.userID ? game.teamB.userID : game.teamA.userID;
        stats.users[game.winner].wins += 1;
        stats.users[loser].losses += 1;
        // check if either score is the minimum/maximum
        if (game.winnerScore > stats.maxScore.winnerScore) {
            stats.maxScore = game;
        }
        if (game.loserScore < stats.minScore.loserScore) {
            stats.minScore = game;
        }
        if (diff > blowout) {
            stats.biggestBlowout = game;
        }
        if (diff < closest) {
            stats.closestGame = game;
        }
    }

    return stats;
}

function getUserMatchupStats(users: User[], games: GameStats[]): UserMatchupStats {
    const stats = {};
    // initialize with user ID permutations
    for (const user of users) {
        stats[user.id] = {};
        for (const uuser of users) {
            if (uuser.id != user.id) {
                stats[user.id][uuser.id] = 0;
            }
        }
    }

    // iterate over games info
    for (const game of games) {
        const loser = game.winner == game.teamA.userID ? game.teamB.userID : game.teamA.userID;
        stats[game.winner][loser] += 1;
    }

    return stats;
}

function transactionAdds(transaction: Transaction): number {
    if (transaction.adds == null) {
        return 0;
    } else {
        return Object.keys(transaction.adds).length;
    }
}

function getTransactionStats(
    users: User[],
    rosters: Roster[],
    transactions: {[year: number]: Transaction[]},
): TransactionStats {
    const stats = {};
    for (const user of users) {
        stats[user.id] = {
            tradesProposed: 0,
            tradesCompleted: 0,
            playerTransactions: 0,
            faabSpent: 0,
        };
    }

    // grab transaction info
    for (const year in transactions) {
        for (const transaction of transactions[year]) {
            if (transaction.type == "trade") {
                stats[transaction.creator].tradesProposed += 1;
                if (transaction.status == "complete") {
                    for (const rosterID of transaction.rosterIDs) {
                        const userID = rosterIdToUserId(rosters, rosterID);
                        stats[userID].tradesCompleted += 1;
                    }
                }
            }
            if (transaction.type == "free_agent" && transaction.status == "complete") {
                const rosterID = transaction.rosterIDs[0];
                const userID = rosterIdToUserId(rosters, rosterID);
                stats[userID].playerTransactions += transactionAdds(transaction);
            }
            if (transaction.type == "waiver" && transaction.status == "complete") {
                const rosterID = transaction.rosterIDs[0];
                const userID = rosterIdToUserId(rosters, rosterID);
                stats[userID].playerTransactions += transactionAdds(transaction);
                stats[userID].faabSpent += transaction.waiverBid;
            }
        }
    }

    return stats;
}

export async function getLeagueStats(leagueID: string): Promise<Info> {
    // get league info across all years for the selected league
    const leagueData = await getLeagueInfo(leagueID);
    // get the NFL state to determine the progress of the current year
    const nflState = await getNflState();
    // get league user info for the selected league
    const users = await getLeagueUsers(leagueID);
    // get league roster info for the selected league
    const rosters = await getLeagueRosters(leagueID);
    // get league matchup info across all years for the selected league
    const matchups = await getLeagueMatchups(leagueID, leagueData, nflState);
    // get league transaction info across all years for the selected league
    const transactions = await getLeagueTransactions(leagueID, leagueData, nflState);

    // post-processing:
    // combine the matchup data into individual game data
    const gameStats = getGameStats(rosters, matchups);
    // combine the game data into per-user matchup stats
    const matchupStats = getMatchupStats(users, gameStats);
    // combine the game data into user-vs.-user matchup stats
    const userMatchupStats = getUserMatchupStats(users, gameStats);
    // combine the transaction data into stats
    const transactionStats = getTransactionStats(users, rosters, transactions);

    // combine queries into a single object
    const info: Info = {
        games: gameStats,
        league: leagueData,
        matchups: matchupStats,
        rosters: rosters,
        transactions: transactionStats,
        users: users,
        userMatchups: userMatchupStats,
    };

    return info;
}
