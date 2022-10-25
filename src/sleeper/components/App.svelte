<!--
    App.svelte
    main application component
-->

<script>
    import "../base.css";
    import { currentLeaguesInfo, leagueAllInfo, loading, userInfo } from "../stores.js";

    import LeagueSelector from "./LeagueSelector.svelte";
    import Spinner from "./Spinner.svelte";
    import UserLogin from "./UserLogin.svelte";

    // FIXME: DEBUG
    function foo() {
        console.log($leagueAllInfo);
        return "success";
    }
</script>

<main class="vflex">
    {#if $loading}
        <Spinner/>
    {:else if $leagueAllInfo}
        <p>{foo()}</p>
    {:else if $userInfo && $currentLeaguesInfo}
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

