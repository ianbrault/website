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
        curr_query,
        league_info,
        loading_progress,
        num_queries,
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
        try {
            let info = {};
            // start from the current year and work backwards
            let id = league_id;
            let current_year = new Date().getFullYear();
            let year = current_year;
            while (id > 0) {
                console.log(`getting matchups for league "${league_info[year].name}" year ${year}`);
                let matchups = [];
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
                    let week_matchups = await get_league_matchups_for_week(id, w);
                    matchups.push(week_matchups);
                    curr_query.update((n) => n + 1);
                }
                info[year] = matchups;
                id = league_info[year].previous_league_id;
                year--;
            }
            return info;
        } catch (err) {
            console.error(`league matchup lookup failed: ${err}`);
            return null;
        }
    }

    async function on_submit(event) {
        event.preventDefault();
        let league_id = selected_league;
        if (!league_id) {
            return;
        }
        loading_progress.set(true);

        // get league info across all years for the selected league
        console.log(`searching for league ${league_id}`);
        let league_data = await get_all_league_info(league_id);
        let n_weeks = 0;
        let current_year = new Date().getFullYear();
        if (league_data) {
            n_weeks = league_data[current_year].settings.playoff_week_start - 1;
        }

        // get the NFL state to determine the progress of the current year
        let nfl_state = await get_nfl_state();

        // set progress bar for remaining queries
        num_queries.set(((Object.keys(league_data).length - 1) * n_weeks) + nfl_state.week);

        // get league user info for the selected league
        let league_user_data = await get_league_users(league_id);
        curr_query.update((n) => n + 1);

        // get league roster info for the selected league
        let league_roster_data = await get_league_rosters(league_id);
        curr_query.update((n) => n + 1);

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
        loading_progress.set(false);
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

