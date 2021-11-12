<!--
    BetForm.svelte
    used to input bets
-->

<script>
    import Labeled from "./Labeled.svelte";
    import NBABetForm from "./NBABetForm.svelte";

    import "../common.css";

    let selected_sport;

    // NOTE: add supported sports here
    let sports = [
        "NBA",
        "NFL",
        "NCAAF",
        "Formula 1",
    ];
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

    {#if selected_sport == "NBA"}
        <NBABetForm/>
    {:else}
        <div class="spacer"/>
    {/if}
</form>

<style>
    form {
        width: 100%;
        padding: 16px;
        align-items: center;
        gap: 16px;
    }
</style>
