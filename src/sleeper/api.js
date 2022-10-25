/*
** api.js
*/

const URL_BASE = "https://api.sleeper.app/v1";

/*
** gets the user data associated with the given username
*/
export async function getUser(username) {
    try {
        let url = `${URL_BASE}/user/${username}`;
        console.log(`query: ${url}`);
        return await fetch(url).then((res) => res.json());
    } catch (err) {
        console.error(`user lookup failed: ${err}`);
        return null;
    }
}

/*
** gets all NFL league data from the current year for the given user ID
*/
export async function getUserCurrentLeagues(userID) {
    try {
        let currentYear = new Date().getFullYear();
        let url = `${URL_BASE}/user/${userID}/leagues/nfl/${currentYear}`;
        console.log(`query: ${url}`);
        return await fetch(url).then((res) => res.json());
    } catch (err) {
        console.error(`user league lookup failed: ${err}`);
        return null;
    }
}

/*
** gets the NFL league data for the given league ID
*/
export async function getLeagueInfo(leagueID) {
    try {
        let url = `${URL_BASE}/league/${leagueID}`;
        console.log(`query: ${url}`);
        return await fetch(url).then((res) => res.json());
    } catch (err) {
        console.error(`league lookup failed: ${err}`);
        return null;
    }
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

