<!--
    BetForm.svelte
    used to input bets
-->

<script>
    import "../common.css";

    import { get } from "svelte/store";

    import Labeled from "./Labeled.svelte";

    import { NBATeamFullName, NBATeamCodes } from "../nba.js";
    import { NFLTeamFullName, NFLTeamCodes } from "../nfl.js";
    import { user_logged_in, user_bets } from "../stores.js";
    import { dateToInputString, post, stripNonNumeric } from "../utils.js";

    // form inputs
    let selected_sport;
    // note: default the date to today
    let date = dateToInputString(new Date());
    let team;
    let opponent;
    // note: bind the following to the input elements in order to format
    let line;
    let odds;
    let wager;

    // NOTE: add supported sports here
    let sports = [
        "NBA",
        "NFL",
        "NCAAMBB",
        "NCAAF",
        "F1",
    ];

    function getTeams(sport) {
        if (sport == "NBA") {
            return NBATeamCodes;
        } else if (sport == "NFL") {
            return NFLTeamCodes;
        } else {
            return [];
        }
    }

    function getTeamName(sport, team) {
        if (sport == "NBA") {
            return NBATeamFullName(team);
        } else if (sport == "NFL") {
            return NFLTeamFullName(team);
        } else {
            return team;
        }
    }

    function submitButtonEnabled(inputs) {
        let ena = true;
        inputs.forEach((input) => {
            if (input == undefined) {
                ena = false;
            } else {
                let x = (typeof input == "string") ? input : input.value;
                ena = ena && x != undefined && x.length > 0;
            }
        });
        return ena;
    }

    function formatLine(e) {
        let val = e.target.value;
        let valU = val.toUpperCase()
        // note: handle "ML" and "PK"
        if (valU.startsWith("ML") || valU.startsWith("PK")) {
            line.value = val.toUpperCase().substring(0, 2);
        } else if (valU.startsWith("M") || valU.startsWith("P")) {
            line.value = val.toUpperCase().substring(0, 1);
        } else {
            // remove non-numeric characters
            val = stripNonNumeric(val, ['+', '-', '.']);
            // ensure that the value has a leading sign
            if (val.length > 0 && val[0] != '+' && val[0] != '-') {
                val = `+${val}`;
            }
            line.value = val;
        }
    }

    function formatOdds(e) {
        let val = e.target.value;
        // remove non-numeric characters
        val = stripNonNumeric(val, ['+', '-']);
        // ensure that the value has a leading sign
        if (val.length > 0 && val[0] != '+' && val[0] != '-') {
            val = `+${val}`;
        }
        odds.value = val;
    }

    function formatWager(e) {
        let val = e.target.value;
        // remove non-numeric characters
        val = stripNonNumeric(val, ['.', '$']);
        // add the leading dollar sign
        if (val.length > 0 && val[0] != '$') {
            val = "$" + val;
        }
        // check for multiple decimal points and remove the last, if so
        if (val.endsWith('.') && val.indexOf('.') != val.lastIndexOf('.')) {
            val = val.substring(0, val.length - 1);
        }
        // ensure that there are only a max of 2 decimal digits
        if (val.indexOf('.') > 0 && val.indexOf('.') < val.length - 3) {
            val = val.substring(0, val.length - 1);
        }
        // add a leading 0 for cents inputs (why are you betting < $1 though?)
        if (val == "$.") {
            val = "$0.";
        }
        wager.value = val;
    }

    async function onSubmit() {
        // note: strip the dollar sign from the wager
        let wager_val = wager.value.substring(1, wager.value.length);
        let body = {};
        if (selected_sport == "F1") {
            body = {
                date: date,
                driver: team,
                event: opponent,
                odds: odds.value,
                wager: wager_val,
                user: get(user_logged_in),
            };
        } else {
            body = {
                date: date,
                team: team,
                opponent: opponent,
                line: line.value,
                odds: odds.value,
                wager: wager_val,
                user: get(user_logged_in),
            };
        }
        let url = `/bets/${selected_sport.toLowerCase()}/add`;
        let res = await post(url, body);
        if (res.status == 200) {
            let bet = await res.json();
            user_bets.update((b) => {
                b[selected_sport].push(bet);
                return b;
            });
        } else {
            alert(await res.text());
        }
        // clear the form input
        team = "";
        opponent = "";
        line.value = "";
        odds.value = "";
        wager.value = "";
    }
</script>

<form class="bordered-round hflex">
    <!-- select the sport to populate the rest of the form -->
    <Labeled text="sport">
        <!-- clear the query body when the sport is changed -->
        <select bind:value={selected_sport}>
            <option disabled selected value>&nbsp;</option>
            {#each sports as sport}
                <option value={sport}>{sport}</option>
            {/each}
        </select>
    </Labeled>

    <!-- date -->
    <Labeled text="date">
        <input type="date" bind:value={date}>
    </Labeled>

    {#if selected_sport == "F1"}
        <!-- driver -->
        <Labeled text="driver">
            <input id="driver" bind:value={team}>
        </Labeled>
    {:else}
        <!-- team (pick to win) -->
        <Labeled text="team">
            {#if selected_sport == "NCAAMBB" || selected_sport == "NCAAF"}
                <input id="team" bind:value={team}>
            {:else}
                <select id="team" bind:value={team}>
                    <option disabled selected value>&nbsp;</option>
                    {#each getTeams(selected_sport) as team}
                        <option value={team}>{getTeamName(selected_sport, team)}</option>
                    {/each}
                </select>
            {/if}
        </Labeled>
    {/if}

    {#if selected_sport == "F1"}
        <!-- event -->
        <Labeled text="event">
            <input id="event" bind:value={opponent}>
        </Labeled>
    {:else}
        <!-- opponent -->
        <Labeled text="opponent">
            {#if selected_sport == "NCAAMBB" || selected_sport == "NCAAF"}
                <input id="opponent" bind:value={opponent}>
            {:else}
                <select id="opponent" bind:value={opponent}>
                    <option disabled selected value>&nbsp;</option>
                    {#each getTeams(selected_sport) as team}
                        <option value={team}>{getTeamName(selected_sport, team)}</option>
                    {/each}
                </select>
            {/if}
        </Labeled>
    {/if}

    {#if selected_sport != "F1"}
        <!-- line -->
        <Labeled text="line (or ML/PK)">
            <input id="line" bind:this={line} on:input={formatLine}>
        </Labeled>
    {/if}

    <!-- odds -->
    <Labeled text="odds">
        <input id="odds" bind:this={odds} on:input={formatOdds}>
    </Labeled>

    <!-- wager -->
    <Labeled text="wager">
        <input
            id="wager" placeholder="$0.00"
            bind:this={wager} on:input={formatWager}
        >
    </Labeled>

    <div class="spacer"/>

    <button
        disabled={!submitButtonEnabled([team, opponent, line, odds, wager])}
        on:click|preventDefault={onSubmit}
    >
        submit
    </button>
</form>

<style>
    form {
        width: 100%;
        padding: 16px;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
    }

    #team, #opponent {
        width: 220px;
    }

    #line {
        width: 110px;
    }

    #odds {
        width: 70px;
    }

    #wager {
        width: 90px;
    }

    #driver {
        width: 160px;
    }

    #event {
        width: 200px;
    }

    #line, #odds, #wager {
        text-align: right;
    }

    button {
        padding: 4px 20px;
    }
</style>
