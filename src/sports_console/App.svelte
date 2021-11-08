<!--
    App.svelte
    main application component
-->

<script>
    import BetForm from "./BetForm.svelte";
    import LoginForm from "./LoginForm.svelte";

    let user_logged_in = false;
</script>

<main>
    {#if !user_logged_in}
        <LoginForm/>
    {:else}
        <BetForm/>
    {/if}
</main>

<style>
    main {
        width: 100%;
        height: 100%;
        padding: 32px;
    }
</style>
