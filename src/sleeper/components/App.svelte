<!--
    App.svelte
    main application component
-->

<script>
    import "../base.css";
    import {
        leagueInfo,
        loadingProgress,
        loadingSpinner,
        userLeagues,
    } from "../stores.js";

    import LeagueSelector from "./LeagueSelector.svelte";
    import QueryProgressBar from "./QueryProgressBar.svelte";
    import Spinner from "./Spinner.svelte";
    import UserLogin from "./UserLogin.svelte";

    // FIXME: DEBUG
    function foo() {
        console.log($leagueInfo);
        return "success";
    }
</script>

<main class="vflex">
    {#if $loadingSpinner}
        <Spinner/>
    {:else if $loadingProgress}
        <QueryProgressBar/>
    {:else if $leagueInfo}
        <p>{foo()}</p>
    {:else if $userLeagues}
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

