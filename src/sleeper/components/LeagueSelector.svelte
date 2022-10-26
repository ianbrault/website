<!--
    LeagueSelector.svelte
    component used to select a user league
-->

<script>
    import "../base.css";
    import {
        getAllLeagueInfo,
        getLeagueMatchupsForWeek,
        getLeagueUsers,
    } from "../api.js";
    import {
        currQuery,
        leagueInfo,
        loadingProgress,
        numQueries,
        userLeagues,
    } from "../stores.js";

    let selectedLeague;

    function leagues() {
        let names = [];
        $userLeagues.forEach((league) => {
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

    function clearStores() {
        leagueInfo.set(null);
        userLeagues.set(null);
    }

    async function getAllLeagueMatchups(leagueID, leagueInfo) {
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
                    currQuery.update((n) => n + 1);
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

    async function onSubmit(event) {
        event.preventDefault();
        let leagueID = selectedLeague;
        if (!leagueID) {
            return;
        }
        loadingProgress.set(true);

        // get league info across all years for the selected league
        console.log(`searching for league ${leagueID}`);
        let leagueData = await getAllLeagueInfo(leagueID);

        // set progress bar for remaining queries
        // TODO: BETTER WAY TO SET THIS
        let nWeeks = 17;
        numQueries.set(Object.keys(leagueData).length * nWeeks);

        // get league user info for the selected league
        let leagueUserData = await getLeagueUsers(leagueID);
        currQuery.update((n) => n + 1);

        // get league matchup info across all years for the selected league
        let leagueMatchupData = await getAllLeagueMatchups(leagueID, leagueData);

        if (leagueData && leagueUserData && leagueMatchupData) {
            // combine queries into a single object
            let leagueAllData = {
                users: leagueUserData,
                years: {},
            };
            Object.keys(leagueData).forEach((year) => {
                leagueAllData.years[year] = {
                    info: leagueData[year],
                    matchups: leagueMatchupData[year],
                };
            });
            leagueInfo.set(leagueAllData);
        } else {
            alert(`failed to find league ${leagueID}`);
            clearStores();
        }
        loadingProgress.set(false);
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

