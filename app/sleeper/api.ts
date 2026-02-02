/*
** app/sleeper/api.ts
*/

const BaseURL = "https://api.sleeper.app/v1";

// Interfaces

export type ByYear<T> = { [year: number]: T };

export interface League {
    id: string;
    name: string;
}

export interface LeagueInfo {
    name: string;
    previousLeagueID: string;
    status: string;
    settings: {
        playoffWeekStart: number;
    };
}

export interface Matchup {
    matchupID: number;
    players: string[];
    playersPoints: number[];
    rosterID: number;
    starters: string[];
    startersPoints: number[];
}

export interface NflState {
    week: number;
    season: number;
    season_type: string;
}

export interface Roster {
    ownerID: string;
}

export interface Transaction {
    adds: { [playerID: number]: number };
    creator: string;
    rosterIDs: number[];
    status: string;
    type: string;
    waiverBid: number;
}

export interface User {
    displayName: string;
    id: string;
}

// Functions

function getNoAwait(url: string): Promise<any> {  // eslint-disable-line @typescript-eslint/no-explicit-any
    return fetch(BaseURL + url)
        .then((res) => res.json())
        .then((body) => {
            if (body == null) {
                throw new Error("Missing data");
            } else {
                return body;
            }
        })
}

async function get(url: string): Promise<any> {  // eslint-disable-line @typescript-eslint/no-explicit-any
    return await getNoAwait(url);
}

// Endpoints
// TODO: future work
// drafts: /league/<id>/drafts
// draft picks: /draft/<id>/picks

/*
** Gets the current NFL state
*/
export async function getNflState(): Promise<NflState> {
    return await get("/state/nfl")
        .then((res) => {
            const season = Number.parseInt(res.season);
            return {
                week: res.week,
                season: season,
                season_type: res.season_type,
            };
        });
}

/*
** Gets the user data associated with the given username
*/
export async function getUserID(username: string): Promise<string> {
    return get(`/user/${username}`)
        .then((res) => res.user_id);
}

/*
** Gets all NFL league data from the current year for the given user ID
*/
export async function getUserCurrentLeagues(userID: string): Promise<League[]> {
    const nflState = await getNflState();
    return await get(`/user/${userID}/leagues/nfl/${nflState.season}`)
        .then((res) => res.map((league: any) => ({  // eslint-disable-line @typescript-eslint/no-explicit-any
            id: league.league_id,
            name: league.name,
        })));
}

/*
** Gets all NFL league data from all years for the given league ID
*/
export async function getLeagueInfo(
    leagueID: string,
    nflState: NflState,
): Promise<ByYear<LeagueInfo>> {
    const info: ByYear<LeagueInfo> = {};
    // start from the current year and work backwards
    let id = leagueID;
    let currentYear = nflState.season;
    while (id !== undefined && id !== null && id !== "0") {
        const yearInfo = await get(`/league/${id}`).then((league) => ({
            name: league.name,
            previousLeagueID: league.previous_league_id,
            status: league.status,
            settings: {
                playoffWeekStart: league.settings.playoff_week_start,
            },
        }));
        info[currentYear] = yearInfo;
        id = yearInfo.previousLeagueID;
        currentYear--;
    }
    return info;
}

/*
** Gets all user info for the given league ID
*/
export async function getLeagueUsers(leagueID: string): Promise<User[]> {
    return await get(`/league/${leagueID}/users`)
        .then((res) => res.map((user: any) => ({  // eslint-disable-line @typescript-eslint/no-explicit-any
            displayName: user.display_name,
            id: user.user_id,
        })));
}

/*
** Gets all roster info for the given league ID
*/
export async function getLeagueRosters(leagueID: string): Promise<Roster[]> {
    return await get(`/league/${leagueID}/rosters`)
        .then((res) => res.map((roster: any) => ({  // eslint-disable-line @typescript-eslint/no-explicit-any
            ownerID: roster.owner_id,
        })));
}

/*
** Gets all matchup info for the given league ID
*/
export async function getLeagueMatchups(
    leagueID: string,
    leagueInfo: ByYear<LeagueInfo>,
    nflState: NflState,
): Promise<ByYear<Matchup[][]>> {
    const info: ByYear<Matchup[][]> = {};
    // store all the promises and join at the end
    const promises: Promise<any>[] = [];  // eslint-disable-line @typescript-eslint/no-explicit-any
    const promiseYears: number[] = [];
    // start from the current year and work backwards
    let id = leagueID;
    const currentYear = nflState.season;
    let year = currentYear;
    while (id !== undefined && id !== null && id !== "0") {
        const nWeeks = leagueInfo[year].settings.playoffWeekStart - 1;
        let end = nWeeks;
        if (year == currentYear) {
            if (leagueInfo[year].status == "in_season") {
                end = nflState.week - 1;
            }
        }
        for (let week = 1; week <= end; week++) {
            const res = getNoAwait(`/league/${id}/matchups/${week}`).then((res) => res.map((matchup: any) => ({  // eslint-disable-line @typescript-eslint/no-explicit-any
                matchupID: matchup.matchup_id,
                players: matchup.players,
                playersPoints: matchup.players_points,
                rosterID: matchup.roster_id,
                starters: matchup.starters,
                startersPoints: matchup.starters_points,
            })));
            promises.push(res);
            promiseYears.push(year);
        }
        id = leagueInfo[year].previousLeagueID;
        year--;
    }
    const responses = await Promise.all(promises);
    // assign results of the promises
    for (let i = 0; i < responses.length; i++) {
        const year = promiseYears[i];
        if (!(year in info)) {
            info[year] = [];
        }
        info[year].push(responses[i]);
    }
    return info;
}

/*
** Gets all transaction info for the given league ID
*/
export async function getLeagueTransactions(
    leagueID: string,
    leagueInfo: ByYear<LeagueInfo>,
    nflState: NflState,
): Promise<ByYear<Transaction[]>> {
    const info: ByYear<Transaction[]> = {};
    // store all the promises and join at the end
    const promises: Promise<any>[] = [];  // eslint-disable-line @typescript-eslint/no-explicit-any
    const promiseYears: number[] = [];
    // start from the current year and work backwards
    let id = leagueID;
    const currentYear = nflState.season;
    let year = currentYear;
    while (id !== undefined && id !== null && id !== "0") {
        const nWeeks = leagueInfo[year].settings.playoffWeekStart - 1;
        let end = nWeeks;
        if (year == currentYear) {
            end = nflState.week;
        }
        for (let week = 1; week <= end; week++) {
            const res = getNoAwait(`/league/${id}/transactions/${week}`).then((res) => res.map((transaction: any) => ({  // eslint-disable-line @typescript-eslint/no-explicit-any
                adds: transaction.adds,
                creator: transaction.creator,
                rosterIDs: transaction.roster_ids,
                status: transaction.status,
                type: transaction.type,
                waiverBid: transaction.settings ? transaction.settings.waiver_bid : 0,
            })));
            promises.push(res);
            promiseYears.push(year);
        }
        id = leagueInfo[year].previousLeagueID;
        year--;
    }
    const responses = await Promise.all(promises);
    // assign results of the promises
    for (let i = 0; i < responses.length; i++) {
        const year = promiseYears[i];
        if (!(year in info)) {
            info[year] = [];
        }
        for (const transaction of responses[i]) {
            info[year].push(transaction);
        }
    }
    return info;
}
