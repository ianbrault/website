/*
** sleeper/src/api.ts
*/

const BaseURL = "https://api.sleeper.app/v1";

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
}

export interface Roster {
    ownerID: string;
}

export interface Transaction {
    adds: {[playerID: number]: number};
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

async function get(url: string): Promise<any> {
    console.debug(`query: ${url}`);
    return await fetch(url).then((res) => res.json());
}

async function getNoAwait(url: string): Promise<any> {
    console.debug(`query: ${url}`);
    return fetch(url).then((res) => res.json());
}

/*
** gets the current NFL state
*/
export async function getNflState(): Promise<NflState> {
    const url = `${BaseURL}/state/nfl`;
    return await get(url).then((res) => ({
        week: res.week,
    }));
}

/*
** gets the user data associated with the given username
*/
export async function getUserID(username: string): Promise<string> {
    const url = `${BaseURL}/user/${username}`;
    return await get(url).then((res) => res.user_id);
}

/*
** gets all NFL league data from the current year for the given user ID
*/
export async function getUserCurrentLeagues(userID: string): Promise<League[]> {
    const currentYear = new Date().getFullYear();
    const url = `${BaseURL}/user/${userID}/leagues/nfl/${currentYear}`;
    return await get(url).then((res) => res.map((league: any) => ({
        id: league.league_id,
        name: league.name,
    })));
}

/*
** gets all NFL league data from all years for the given league ID
*/
export async function getLeagueInfo(leagueID: string): Promise<{[year: number]: LeagueInfo}> {
    const info = {};
    // start from the current year and work backwards
    let id = leagueID;
    let currentYear = new Date().getFullYear();
    while (id !== undefined && id !== "0") {
        const url = `${BaseURL}/league/${id}`;
        const yearInfo = await get(url).then((league) => ({
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
** gets all user info for the given league ID
*/
export async function getLeagueUsers(leagueID: string): Promise<User[]> {
    const url = `${BaseURL}/league/${leagueID}/users`;
    return await get(url).then((res) => res.map((user: any) => ({
        displayName: user.display_name,
        id: user.user_id,
    })));
}

/*
** gets all roster info for the given league ID
*/
export async function getLeagueRosters(leagueID: string): Promise<Roster[]> {
    const url = `${BaseURL}/league/${leagueID}/rosters`;
    return await get(url).then((res) => res.map((roster: any) => ({
        ownerID: roster.owner_id,
    })));
}

/*
** gets all matchup info for the given league ID
*/
export async function getLeagueMatchups(
    leagueID: string,
    leagueInfo: {[year: number]: LeagueInfo},
    nflState: NflState,
): Promise<{[year: number]: Matchup[][]}> {
    const info = {};
    // store all the promises and join at the end
    const promises: Promise<any>[] = [];
    const promiseYears: number[] = [];
    // start from the current year and work backwards
    let id = leagueID;
    const currentYear = new Date().getFullYear();
    let year = currentYear;
    while (id !== undefined && id !== "0") {
        const nWeeks = leagueInfo[year].settings.playoffWeekStart - 1;
        let end = nWeeks;
        if (year == currentYear) {
            if (leagueInfo[year].status == "in_season") {
                end = nflState.week - 1;
            } else {
                end = nflState.week;
            }
        }
        for (let week = 1; week <= end; week++) {
            const url = `${BaseURL}/league/${id}/matchups/${week}`;
            const res = getNoAwait(url).then((res) => res.map((matchup: any) => ({
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
** gets all transaction info for the given league ID
*/
export async function getLeagueTransactions(
    leagueID: string,
    leagueInfo: {[year: number]: LeagueInfo},
    nflState: NflState,
): Promise<{[year: number]: Transaction[]}> {
    const info = {};
    // store all the promises and join at the end
    const promises: Promise<any>[] = [];
    const promiseYears: number[] = [];
    // start from the current year and work backwards
    let id = leagueID;
    const currentYear = new Date().getFullYear();
    let year = currentYear;
    while (id !== undefined && id !== "0") {
        const nWeeks = leagueInfo[year].settings.playoffWeekStart - 1;
        let end = nWeeks;
        if (year == currentYear) {
            end = nflState.week;
        }
        for (let week = 1; week <= end; week++) {
            const url = `${BaseURL}/league/${id}/transactions/${week}`;
            const res = getNoAwait(url).then((res) => res.map((transaction: any) => ({
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

/*
** TODO: future endpoints
** drafts: /league/<id>/drafts
** draft picks: /draft/<id>/picks
*/
