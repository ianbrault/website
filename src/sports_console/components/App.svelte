<!--
    App.svelte
    main application component
-->

<script>
    import BetMenu from "./BetMenu.svelte";
    import LoginForm from "./LoginForm.svelte";

    import { user_logged_in } from "../stores.js";
</script>

<main>
    {#if $user_logged_in == undefined}
        <LoginForm/>
    {:else}
        <BetMenu/>
    {/if}
</main>

<style>
    main {
        width: 100%;
        height: 100%;
        padding: 32px;
    }
</style>
