<!--
    BetMenu.svelte
    main component for displaying/inputting bets
-->

<script>
    import BetForm from "./BetForm.svelte";
    import BetView from "./BetView.svelte";
</script>

<div id="bet-container" class="vflex-center">
    <BetView/>
    <BetForm/>
</div>

<style>
    #bet-container {
        width: 100%;
        height: 100%;
        gap: 32px;
    }
</style>
