<!--
    App.svelte
    main application component
-->

<script>
    import "../base.css";
    import {
        league_info,
        loading,
        user_leagues,
    } from "../stores.js";

    import LeagueSelector from "./LeagueSelector.svelte";
    import LeagueStatsView from "./LeagueStatsView.svelte";
    import Spinner from "./Spinner.svelte";
    import UserLogin from "./UserLogin.svelte";
</script>

<main class="vflex">
    {#if $loading}
        <Spinner/>
    {:else if $league_info}
        <LeagueStatsView/>
    {:else if $user_leagues}
        <LeagueSelector/>
    {:else}
        <UserLogin/>
    {/if}
</main>

<style>
    main {
        justify-content: center;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        align-items: center;
        padding: 32px 64px 64px 64px;
    }
</style>

