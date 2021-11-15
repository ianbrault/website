<!--
    BetForm.svelte
    used to input bets
-->

<script>
    import "../common.css";

    import { get } from "svelte/store";

    import Labeled from "./Labeled.svelte";

    import { teamFullName, TeamCodes } from "../nba.js";
    import { user_logged_in, user_bets } from "../stores.js";
    import { dateToInputString, post, stripNonNumeric } from "../utils.js";

    // form inputs
    let selected_sport;
    // note: default the date to today
    let date = dateToInputString(new Date());
    let bet_type;
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
        "NCAAF",
        "Formula 1",
    ];

    function betTypeOnChange() {
        if (bet_type == "ML") {
            line.value = "ML";
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
        // remove non-numeric characters
        val = stripNonNumeric(val, ['+', '-', '.']);
        // ensure that the value has a leading sign
        if (val.length > 0 && val[0] != '+' && val[0] != '-') {
            val = `+${val}`;
        }
        line.value = val;
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
        let body = {
            date: date,
            bet_type: bet_type,
            team: team,
            opponent: opponent,
            line: line.value,
            odds: odds.value,
            wager: wager.value,
            user: get(user_logged_in),
        };
        let res = await post("/bets/nba/add", body);
        // TODO: handle failure
        if (res.status == 200) {
            let bet = await res.json();
            user_bets.update((b) => {
                b["NBA"].push(bet);
                return b;
            });
        }
        // clear the form input
        bet_type = "";
        team = "";
        opponent = "";
        line.value = "";
        odds.value = "";
        wager.value = "";
    }
</script>

<form class="bordered-round hflex">
    <!-- select the sport to populate the rest of the form -->
    <Labeled text="select a sport">
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

    <!-- bet type: spread vs. money line -->
    <div id="bet-type" class="vflex">
        <label>
            <input
                type=radio name="bet_type" value={"spread"}
                bind:group={bet_type} on:change={betTypeOnChange}
            >
            spread
        </label>
        <label>
            <input
                type=radio name="bet_type" value={"ML"}
                bind:group={bet_type} on:change={betTypeOnChange}
            >
            money line
        </label>
    </div>

    <!-- team (pick to win) -->
    <Labeled text="team">
        <select bind:value={team}>
            <option disabled selected value>&nbsp;</option>
            {#each TeamCodes as team}
                <option value={team}>{teamFullName(team)}</option>
            {/each}
        </select>
    </Labeled>

    <!-- opponent -->
    <Labeled text="opponent">
        <select bind:value={opponent}>
            <option disabled selected value>&nbsp;</option>
            {#each TeamCodes as team}
                <option value={team}>{teamFullName(team)}</option>
            {/each}
        </select>
    </Labeled>

    <!-- line -->
    <Labeled text="line">
        <!-- note: no line for money line bets -->
        <input
            class="text-input" disabled={bet_type == "ML"}
            bind:this={line} on:input={formatLine}
        >
    </Labeled>

    <!-- odds -->
    <Labeled text="odds">
        <input class="text-input" bind:this={odds} on:input={formatOdds}>
    </Labeled>

    <!-- wager -->
    <Labeled text="wager">
        <input
            class="text-input" placeholder="$0.00"
            bind:this={wager} on:input={formatWager}
        >
    </Labeled>

    <div class="spacer"/>

    <button
        disabled={!submitButtonEnabled([bet_type, team, opponent, line, odds, wager])}
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
    }

    #bet-type {
        font-size: 13px;
        align-items: flex-start;
        align-self: flex-start;
        margin-right: 8px;
    }

    .text-input {
        text-align: right;
        width: 120px;
    }

    button {
        padding: 4px 20px;
    }
</style>
