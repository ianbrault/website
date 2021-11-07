<!--
    BetForm.svelte
    used to input bets
-->

<script>
    import Labeled from "./Labeled.svelte";
    import NBABetForm from "./NBABetForm.svelte";

    import "./common.css";

    // NOTE: add supported sports here
    let sports = [
        "NBA",
        "NFL",
        "NCAAF",
        "Formula 1",
    ];

    let selected_sport;
</script>

<form class="bordered-round hflex">
    <!-- select the sport to populate the rest of the form -->
    <Labeled text="select a sport">
        <select bind:value={selected_sport}>
            <option disabled selected value>&nbsp;</option>
            {#each sports as sport}
                <option value={sport}>{sport}</option>
            {/each}
        </select>
    </Labeled>

    {#if selected_sport == "NBA"}
        <NBABetForm/>
    {/if}

    <div class="spacer"/>

    <!-- TODO: un-disable -->
    <button disabled>submit</button>
</form>

<style>
    form {
        padding: 8px;
        align-items: center;
    }

    .spacer {
        flex-grow: 1;
    }
</style>
