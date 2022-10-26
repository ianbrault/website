/*
** api.js
*/

const URL_BASE = "https://api.sleeper.app/v1";

async function get(url, error) {
    try {
        console.log(`query: ${url}`);
        return await fetch(url).then((res) => res.json());
    } catch (err) {
        console.error(`${error}: ${err}`);
        return null;
    }
}

/*
** gets the user data associated with the given username
*/
export async function getUser(username) {
    let url = `${URL_BASE}/user/${username}`;
    return await get(url, "user lookup failed");
}

/*
** gets all NFL league data from the current year for the given user ID
*/
export async function getUserCurrentLeagues(userID) {
    let currentYear = new Date().getFullYear();
    let url = `${URL_BASE}/user/${userID}/leagues/nfl/${currentYear}`;
    return await get(url, "user league lookup failed");
}

/*
** gets the NFL league data for the given league ID
*/
export async function getLeagueInfo(leagueID) {
    let url = `${URL_BASE}/league/${leagueID}`;
    return await get(url, "league lookup failed");
}

/*
** gets all NFL league data from all years for the given league ID
*/
export async function getAllLeagueInfo(leagueID) {
    try {
        let info = {};
        // start from the current year and work backwards
        let id = leagueID;
        let currentYear = new Date().getFullYear();
        while (id > 0) {
            let leagueInfo = await getLeagueInfo(id);
            info[currentYear] = leagueInfo;
            id = leagueInfo.previous_league_id;
            currentYear--;
        }
        return info;
    } catch (err) {
        console.error(`league lookup failed: ${err}`);
        return null;
    }
}

/*
** gets all user info for the given league ID
*/
export async function getLeagueUsers(leagueID) {
    let url = `${URL_BASE}/league/${leagueID}/users`;
    return await get(url, "league user lookup failed");
}

/*
** get the matchup info from the given week for the given league ID
*/
export async function getLeagueMatchupsForWeek(leagueID, week) {
    let url = `${URL_BASE}/league/${leagueID}/matchups/${week}`;
    return await get(url, `league ${week} matchups lookup failed`);
}

/*
** gets all matchup info for the given league ID
*/
export async function getAllLeagueMatchups(leagueID, leagueInfo) {
    try {
        let info = {};
        // start from the current year and work backwards
        let id = leagueID;
        let currentYear = new Date().getFullYear();
        while (id > 0) {
            let matchups = [];
            // TODO: SWITCH BETWEEN 16 and 17
            let nWeeks = 17;
            for (let w = 1; w <= nWeeks; w++) {
                let weekMatchups = await getLeagueMatchupsForWeek(leagueID, w);
                matchups.push(weekMatchups);
            }
            info[currentYear] = matchups;
            id = leagueInfo[currentYear].previous_league_id;
            currentYear--;
        }
        return info;
    } catch (err) {
        console.error(`league matchup lookup failed: ${err}`);
        return null;
    }
}

