<!--
    NBABetForm.svelte
    NBA portion of the bet form
-->

<script>
    import { get } from "svelte/store";

    import Labeled from "./Labeled.svelte";

    import { teamFullName, TeamCodes } from "../nba.js";
    import { user_logged_in, user_bets } from "../stores.js";
    import { post } from "../utils.js";

    import "../common.css";

    // default the date to today
    let now = new Date();
    // note: month is zero-indexed
    let month_string = (now.getMonth() + 1).toString().padStart(2, "0");
    let day_string = now.getDate().toString().padStart(2, "0");
    let now_string = `${now.getFullYear()}-${month_string}-${day_string}`;

    // form inputs
    let date = now_string;
    let bet_type;
    let team;
    let opponent;
    let line;
    let odds;
    let wager;

    function betTypeOnChange() {
        if (bet_type == "ML") {
            line = "ML";
        }
    }

    function submitButtonEnabled(inputs) {
        let ena = true;
        inputs.forEach((x) => {
            ena = ena && x != undefined && x.length > 0;
        });
        return ena;
    }

    async function onSubmit() {
        let body = {
            date: date,
            bet_type: bet_type,
            team: team,
            opponent: opponent,
            line: line,
            odds: odds,
            wager: wager,
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
        line = "";
        odds = "";
        wager = "";
    }
</script>

<div id="nba-bet-wrapper" class="hflex-center spacer">
    <!-- date -->
    <Labeled text="date">
        <input type="date" bind:value={date}>
    </Labeled>

    <!-- bet type: spread vs. money line -->
    <div id="bet-type" class="vflex">
        <label>
            <input type=radio bind:group={bet_type} name="bet_type" value={"spread"} on:change={betTypeOnChange}>
            spread
        </label>
        <label>
            <input type=radio bind:group={bet_type} name="bet_type" value={"ML"} on:change={betTypeOnChange}>
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
        <input class="text-input" bind:value={line} disabled={bet_type == "ML"}>
    </Labeled>

    <!-- odds -->
    <Labeled text="odds">
        <input class="text-input" bind:value={odds}>
    </Labeled>

    <!-- wager -->
    <Labeled text="wager">
        <input class="text-input" bind:value={wager} placeholder="$0.00">
    </Labeled>

    <div class="spacer"/>

    <button disabled={!submitButtonEnabled([bet_type, team, opponent, line, odds, wager])} on:click|preventDefault={onSubmit}>
        submit
    </button>
</div>

<style>
    #nba-bet-wrapper {
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
