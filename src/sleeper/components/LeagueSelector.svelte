<!--
    LeagueSelector.svelte
    component used to select a user league
-->

<script>
    import "../base.css";
    import {
        get_all_league_info,
        get_league_matchups_for_week,
        get_league_rosters,
        get_league_users,
        get_nfl_state,
    } from "../api.js";
    import {
        league_info,
        loading,
        user_leagues,
    } from "../stores.js";

    let selected_league;

    function leagues() {
        let names = [];
        for (const league of $user_leagues) {
            names.push({id: league.league_id, name: league.name});
        }
        names.sort((a, b) => a.id - b.id);
        return names;
    }

    function clear_stores() {
        league_info.set(null);
        user_leagues.set(null);
    }

    async function get_all_league_matchups(league_id, league_info, nfl_state) {
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
                console.log(`getting matchups for league "${league_info[year].name}" year ${year}`);
                let n_weeks = league_info[year].settings.playoff_week_start - 1;
                let end;
                if (year == current_year) {
                    if (league_info[year].status == "in_season") {
                        end = nfl_state.week - 1;
                    } else {
                        end = nfl_state.week;
                    }
                } else {
                    end = n_weeks;
                }
                for (let w = 1; w <= end; w++) {
                    promises.push(get_league_matchups_for_week(id, w));
                    promise_years.push(year);
                }
                id = league_info[year].previous_league_id;
                year--;
            }
            // gather promises and assign results
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

    async function on_submit(event) {
        event.preventDefault();
        let league_id = selected_league;
        if (!league_id) {
            return;
        }
        loading.set(true);

        // get league info across all years for the selected league
        console.log(`searching for league ${league_id}`);
        let league_data = await get_all_league_info(league_id);

        // get the NFL state to determine the progress of the current year
        let nfl_state = await get_nfl_state();

        // get league user info for the selected league
        let league_user_data = await get_league_users(league_id);

        // get league roster info for the selected league
        let league_roster_data = await get_league_rosters(league_id);

        // get league matchup info across all years for the selected league
        let league_matchup_data = await get_all_league_matchups(league_id, league_data, nfl_state);

        if (league_data && league_user_data && league_roster_data && league_matchup_data) {
            // combine queries into a single object
            let league_all_data = {
                users: league_user_data,
                rosters: league_roster_data,
                years: {},
            };
            for (const year of Object.keys(league_data)) {
                league_all_data.years[year] = {
                    info: league_data[year],
                    matchups: league_matchup_data[year],
                };
            }
            league_info.set(league_all_data);
        } else {
            alert(`failed to find league ${league_id}`);
            clear_stores();
        }
        loading.set(false);
    }
</script>

<form id="league-input" class="vflex" on:submit={on_submit}>
    <label for="league-input">Select your league:</label>
    {#each leagues() as league (league.id)}
        <label>
            <input type=radio bind:group={selected_league} value={league.id}>
            {league.name}
        </label>
    {/each}
    <button id="league-button">submit</button>
</form>

<style>
    #league-input {
        font-size: 14px;
        justify-content: flex-start;
        gap: 8px;
    }

    #league-button {
        align-self: center;
        padding: 2px 16px;
        margin: 4px;
    }
</style>

