<!--
    GameStatView.svelte
    displays a statistic from a game
-->

<script>
    import "../base.css";
    import { league_info } from "../stores.js";
    import { user_id_to_name } from "../utils.js";

    export let title;
    export let game;
    export let bold_winner = false;
    export let bold_loser = false;

    function winner_name() {
        return user_id_to_name($league_info.users, game.winner);
    }

    function loser_name() {
        let loser = game.winner == game.team_a.user_id ? game.team_b.user_id : game.team_a.user_id;
        return user_id_to_name($league_info.users, loser);
    }

    function week_desc() {
        return `${game.year} WEEK ${game.week + 1}`;
    }
</script>

<div class="stat-wrapper vflex">
    <p class="stat-title">{title}</p>
    <div class="stat-grid">
        <p class:grid-bold={bold_winner}>{winner_name()}</p>
        <p class:grid-bold={bold_winner}>{game.winner_score.toFixed(2)}</p>
        <p class:grid-bold={bold_loser}>{loser_name()}</p>
        <p class:grid-bold={bold_loser}>{game.loser_score.toFixed(2)}</p>
        <p>{week_desc()}</p>
    </div>
</div>

<style>
    .stat-wrapper {
        font-size: 14px;
        margin: 32px 0;
    }

    .stat-title {
        font-weight: 600;
        margin: 4px 0;
    }

    .stat-grid {
        display: grid;
        grid-template-columns: repeat(2, auto);
        grid-template-rows: repeat(3, auto);
        column-gap: 20px;
        row-gap: 2px;
    }

    .stat-grid > p {
        margin: 0;
    }

    .stat-grid > p:nth-child(even) {
        text-align: right;
    }

    .stat-grid > p:last-child {
        font-size: 12px;
    }

    .grid-bold {
        font-weight: 600;
    }
</style>
