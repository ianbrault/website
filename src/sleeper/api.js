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

async function get_no_await(url, error) {
    try {
        console.log(`query: ${url}`);
        return fetch(url).then((res) => res.json());
    } catch (err) {
        console.error(`${error}: ${err}`);
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
async function get_league_matchups_for_week(league_id, week) {
    let url = `${URL_BASE}/league/${league_id}/matchups/${week}`;
    // NOTE: return the Promise so that they can be awaited all at once
    return get_no_await(url, `league ${week} matchups lookup failed`);
}

/*
** gets all matchup info for the given league ID
*/
export async function get_all_league_matchups(league_id, league_info, nfl_state) {
    let info = {};
    // store all the promises and join at the end
    let promises = [];
    let promise_years = [];
    let responses = [];
    try {
        // start from the current year and work backwards
        let id = league_id;
        let current_year = new Date().getFullYear();
        let year = current_year;
        while (id > 0) {
            let n_weeks = league_info[year].settings.playoff_week_start - 1;
            let end = n_weeks;
            if (year == current_year) {
                if (league_info[year].status == "in_season") {
                    end = nfl_state.week - 1;
                } else {
                    end = nfl_state.week;
                }
            }
            for (let w = 1; w <= end; w++) {
                promises.push(get_league_matchups_for_week(id, w));
                promise_years.push(year);
            }
            id = league_info[year].previous_league_id;
            year--;
        }
        responses = await Promise.all(promises);
    } catch (err) {
        console.error(`league matchup lookup failed: ${err}`);
        return null;
    }
    // assign results of the promises
    for (let i = 0; i < responses.length; i++) {
        let year = promise_years[i];
        if (!(year in info)) {
            info[year] = [];
        }
        info[year].push(responses[i]);
    }
    return info;
}

/*
** gets all transaction info from the given week for the given league ID
*/
async function get_league_transactions_for_week(league_id, week) {
    let url = `${URL_BASE}/league/${league_id}/transactions/${week}`;
    // NOTE: return the Promise so that they can be awaited all at once
    return get_no_await(url, `league ${week} transactions lookup failed`);
}

/*
** gets all transaction info for the given league ID
*/
export async function get_all_league_transactions(league_id, league_info, nfl_state) {
    let info = {};
    // store all the promises and join at the end
    let promises = [];
    let promise_years = [];
    let responses = [];
    try {
        // start from the current year and work backwards
        let id = league_id;
        let current_year = new Date().getFullYear();
        let year = current_year;
        while (id > 0) {
            let n_weeks = league_info[year].settings.playoff_week_start - 1;
            let end = n_weeks;
            if (year == current_year) {
                end = nfl_state.week;
            }
            for (let w = 1; w <= end; w++) {
                promises.push(get_league_transactions_for_week(id, w));
                promise_years.push(year);
            }
            id = league_info[year].previous_league_id;
            year--;
        }
        responses = await Promise.all(promises);
    } catch (err) {
        console.error(`league matchup lookup failed: ${err}`);
        return null;
    }
    // assign results of the promises
    for (let i = 0; i < responses.length; i++) {
        let year = promise_years[i];
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
** gets all drafts for the given league ID
*/
export async function get_all_league_drafts(league_id) {
    let url = `${URL_BASE}/league/${league_id}/drafts`;
    return get(url, `league drafts lookup failed`);
}

/*
** gets info for the given draft ID
*/
async function get_draft_picks(draft_id) {
    let url = `${URL_BASE}/draft/${draft_id}/picks`;
    // NOTE: return the Promise so that they can be awaited all at once
    return get_no_await(url, `draft picks lookup failed`);
}

/*
** gets all draft info for the given league ID
*/
export async function get_all_league_draft_picks(draft_info) {
    let info = {};
    // store all the promises and join at the end
    let promises = [];
    let promise_years = [];
    let responses = [];
    try {
        for (const draft of draft_info) {
            promises.push(get_draft_picks(draft.draft_id));
            promise_years.push(Number(draft.season));
        }
        responses = await Promise.all(promises);
    } catch (err) {
        console.error(`league draft picks lookup failed: ${err}`);
        return null;
    }
    // assign results of the promises
    for (let i = 0; i < responses.length; i++) {
        let year = promise_years[i];
        if (!(year in info)) {
            info[year] = [responses[i]];
        }
    }
    return info;
}
