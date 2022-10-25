<!--
    LeagueSelector.svelte
    component used to select a user league
-->

<script>
    import "../base.css";
    import { getAllLeagueInfo } from "../api.js";
    import { currentLeaguesInfo, leagueAllInfo, loading, userInfo } from "../stores.js";

    let selectedLeague;

    function leagues() {
        let names = [];
        $currentLeaguesInfo.forEach((league) => {
            names.push({id: league.league_id, name: league.name});
        });
        names.sort((a, b) => {
            if (a.id > b.id) {
                return 1;
            } else if (a.id < b.id) {
                return -1;
            } else {
                return 0;
            }
        });
        return names;
    }

    async function onSubmit(event) {
        event.preventDefault();
        loading.set(true);

        // get all data across all years for the selected league
        console.log(`searching for league ${selectedLeague}`);
        let leagueData = await getAllLeagueInfo(selectedLeague);
        if (leagueData) {
            leagueAllInfo.set(leagueData);
            loading.set(false);
        } else {
            alert(`failed to find leage ${selectedLeague}`);
            loading.set(false);
            // clear all stores to return to the original form
            userInfo.set(null);
            currentLeaguesInfo.set(null);
        }
    }
</script>

<form id="league-input" class="vflex" on:submit={onSubmit}>
    <label for="league-input">Select your league:</label>
    {#each leagues() as league (league.id)}
        <label>
            <input type=radio bind:group={selectedLeague} value={league.id}>
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

