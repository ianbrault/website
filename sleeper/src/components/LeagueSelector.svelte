<!--
    LeagueSelector.svelte
    component used to select a user league
-->

<script>
    import "../base.css";
    import {
        get_all_league_info,
        get_all_league_matchups,
        get_all_league_transactions,
        get_league_rosters,
        get_league_users,
        get_nfl_state,
    } from "../api.js";
    import {
        league_info,
        loading,
        user_leagues,
    } from "../stores.js";
    import { get_game_stats } from "../utils.js";

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
        // get league transaction info across all years for the selected league
        let league_transaction_data = await get_all_league_transactions(league_id, league_data, nfl_state);
        // post-processing
        // combine the matchup data into individual game data
        let league_game_data = get_game_stats(league_roster_data, league_matchup_data);

        if (
            league_data
            && league_user_data
            && league_roster_data
            && league_transaction_data
            && league_game_data
        ) {
            // combine queries into a single object
            let league_all_data = {
                users: league_user_data,
                rosters: league_roster_data,
                games: league_game_data,
                years: {},
            };
            for (const year of Object.keys(league_data)) {
                league_all_data.years[year] = {
                    info: league_data[year],
                    transactions: league_transaction_data[year],
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
        font-size: 14px;
        align-self: center;
        padding: 2px 16px;
        margin: 4px;
    }
</style>

