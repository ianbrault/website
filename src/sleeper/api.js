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
export async function get_user(username) {
    let url = `${URL_BASE}/user/${username}`;
    return await get(url, "user lookup failed");
}

/*
** gets all NFL league data from the current year for the given user ID
*/
export async function get_user_current_leagues(user_id) {
    let current_year = new Date().getFullYear();
    let url = `${URL_BASE}/user/${user_id}/leagues/nfl/${current_year}`;
    return await get(url, "user league lookup failed");
}

/*
** gets the NFL league data for the given league ID
*/
export async function get_league_info(league_id) {
    let url = `${URL_BASE}/league/${league_id}`;
    return await get(url, "league lookup failed");
}

/*
** gets all NFL league data from all years for the given league ID
*/
export async function get_all_league_info(league_id) {
    try {
        let info = {};
        // start from the current year and work backwards
        let id = league_id;
        let current_year = new Date().getFullYear();
        while (id > 0) {
            let league_info = await get_league_info(id);
            info[current_year] = league_info;
            id = league_info.previous_league_id;
            current_year--;
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
export async function get_league_users(league_id) {
    let url = `${URL_BASE}/league/${league_id}/users`;
    return await get(url, "league user lookup failed");
}

/*
** gets all roster info for the given league ID
*/
export async function get_league_rosters(league_id) {
    let url = `${URL_BASE}/league/${league_id}/rosters`;
    return await get(url, "league roster lookup failed");
}

/*
** get the matchup info from the given week for the given league ID
*/
export async function get_league_matchups_for_week(league_id, week) {
    let url = `${URL_BASE}/league/${league_id}/matchups/${week}`;
    return await get(url, `league ${week} matchups lookup failed`);
}

/*
** gets all matchup info for the given league ID
*/
export async function get_all_league_matchups(league_id, league_info) {
    try {
        let info = {};
        // start from the current year and work backwards
        let id = league_id;
        let current_year = new Date().getFullYear();
        while (id > 0) {
            let matchups = [];
            // TODO: SWITCH BETWEEN 16 and 17
            let n_weeks = 17;
            for (let w = 1; w <= n_weeks; w++) {
                let week_matchups = await get_league_matchups_for_week(league_id, w);
                matchups.push(week_matchups);
            }
            info[current_year] = matchups;
            id = league_info[current_year].previous_league_id;
            current_year--;
        }
        return info;
    } catch (err) {
        console.error(`league matchup lookup failed: ${err}`);
        return null;
    }
}

/*
** gets the current NFL state
*/
export async function get_nfl_state() {
    let url = `${URL_BASE}/state/nfl`;
    return await get(url, `NFL state lookup failed`);
}

