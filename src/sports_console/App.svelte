<!--
    App.svelte
    main application component
-->

<script>
    import { writable} from "svelte/store";

    import BetForm from "./BetForm.svelte";
    import LoginForm from "./LoginForm.svelte";

    let user_logged_in = writable(false);
    let user_bets = writable({});
</script>

<main>
    {#if !$user_logged_in}
        <LoginForm logged_in={user_logged_in} bets={user_bets}/>
    {:else}
        <BetForm bets={$user_bets}/>
    {/if}
</main>

<style>
    main {
        width: 100%;
        height: 100%;
        padding: 32px;
    }
</style>
