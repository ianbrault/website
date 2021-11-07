<!--
    NBABetForm.svelte
    NBA portion of the bet form
-->

<script>
    import Labeled from "./Labeled.svelte";
    import { TeamCodes, TeamNames, TeamLocations } from "./nba.js";

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
</script>

<div class="hflex">
    <!-- date -->
    <Labeled text="date">
        <input type="date" bind:value={date}>
    </Labeled>

    <!-- bet type: spread vs. money line -->
    <div id="bet-type" class="vflex">
        <label>
            <input type=radio bind:group={bet_type} name="bet_type" value={"spread"}>
            spread
        </label>
        <label>
            <input type=radio bind:group={bet_type} name="bet_type" value={"ML"}>
            money line
        </label>
    </div>

    <!-- team (pick to win) -->
    <Labeled text="team">
        <select bind:value={team}>
            <option disabled selected value>&nbsp;</option>
            {#each TeamCodes as team}
                <option value={team}>{TeamLocations[team]} {TeamNames[team]}</option>
            {/each}
        </select>
    </Labeled>

    <!-- opponent -->
    <Labeled text="opponent">
        <select bind:value={opponent}>
            <option disabled selected value>&nbsp;</option>
            {#each TeamCodes as team}
                <option value={team}>{TeamLocations[team]} {TeamNames[team]}</option>
            {/each}
        </select>
    </Labeled>

    <!-- line -->
    <Labeled text="line">
        <!-- note: no line for money line bets -->
        <input bind:value={line} disabled={bet_type == "ML"}>
    </Labeled>

    <!-- odds -->
    <Labeled text="odds">
        <input bind:value={odds}>
    </Labeled>

    <!-- wager -->
    <Labeled text="wager">
        <input bind:value={wager}>
    </Labeled>
</div>

<style>
    #bet-type {
        align-items: flex-start;
    }
</style>
