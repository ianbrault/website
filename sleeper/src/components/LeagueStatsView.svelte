<!--
    LeagueStatsView.svelte
    displays a progress bar for the API queries
-->

<script>
    import "../base.css";
    import { league_info } from "../stores.js";
    import {
        get_matchup_stats,
        get_per_user_matchup_stats,
        get_transaction_stats,
        user_id_to_name,
    } from "../utils.js";

    import GameStatView from "./GameStatView.svelte";
    import StatsListView from "./StatsListView.svelte";

    // post-process some of the league data
    let matchup_stats = get_matchup_stats($league_info);
    let per_user_matchup_stats = get_per_user_matchup_stats($league_info);
    let transaction_stats = get_transaction_stats($league_info);

    // FIXME: DEBUG
    console.log($league_info);
    console.log(matchup_stats);
    console.log(per_user_matchup_stats);
    console.log(transaction_stats);

    function get_league_name() {
        let current_year = new Date().getFullYear();
        return $league_info.years[current_year].info.name;
    }

    function get_win_pct_ratings(stats) {
        let headers = ["Name", "W", "L", "Pct"];
        let entries = [];
        for (const [user_id, user_stats] of Object.entries(stats.users)) {
            entries.push({
                name: user_id_to_name($league_info.users, user_id),
                wins: user_stats.wins,
                losses: user_stats.losses,
                win_pct: (user_stats.wins / (user_stats.wins + user_stats.losses)) * 100,
                // include points_for so that it can be used as a tiebreaker
                points_for: user_stats.points_for,
            });
        }
        // reverse-sort to get descending order
        entries.sort((a, b) => {
            if (a.wins == b.wins) {
                // use points_for to break ties
                return a.points_for - b.points_for;
            } else {
                return a.wins - b.wins;
            }
        }).reverse();
        // transform into the expected StatsListView format
        entries = entries.map((o) => {
            return [o.name, o.wins, o.losses, `${o.win_pct.toFixed(1)}%`];
        });
        return {
            headers: headers,
            entries: entries,
        };
    }

    function get_points_scored_ratings(stats) {
        let headers = ["Name", "PF"];
        let entries = [];
        for (const [user_id, user_stats] of Object.entries(stats.users)) {
            entries.push({
                name: user_id_to_name($league_info.users, user_id),
                points_for: user_stats.points_for,
            });
        }
        // reverse-sort to get descending order
        entries.sort((a, b) => a.points_for - b.points_for).reverse();
        entries = entries.map((o) => [o.name, o.points_for.toFixed(2)]);
        return {
            headers: headers,
            entries: entries,
        };
    }

    function get_points_against_ratings(stats) {
        let headers = ["Name", "PA"];
        let entries = [];
        for (const [user_id, user_stats] of Object.entries(stats.users)) {
            entries.push({
                name: user_id_to_name($league_info.users, user_id),
                points_against: user_stats.points_against,
            });
        }
        entries.sort((a, b) => a.points_against - b.points_against);
        entries = entries.map((o) => [o.name, o.points_against.toFixed(2)]);
        return {
            headers: headers,
            entries: entries,
        };
    }

    function get_bench_points_ratings(stats) {
        let headers = ["Name", "Pts"];
        let entries = [];
        for (const [user_id, user_stats] of Object.entries(stats.users)) {
            entries.push({
                name: user_id_to_name($league_info.users, user_id),
                bench_points: user_stats.bench_points,
            });
        }
        // reverse-sort to get descending order
        entries.sort((a, b) => a.bench_points - b.bench_points).reverse();
        entries = entries.map((o) => [o.name, o.bench_points.toFixed(2)]);
        return {
            headers: headers,
            entries: entries,
        };
    }

    function get_trades_completed_ratings(stats) {
        let headers = ["Name", "Trades"];
        let entries = [];
        for (const [user_id, user_stats] of Object.entries(stats)) {
            entries.push({
                name: user_id_to_name($league_info.users, user_id),
                trades_completed: user_stats.trades_completed,
            });
        }
        // reverse-sort to get descending order
        entries.sort((a, b) => a.trades_completed - b.trades_completed).reverse();
        entries = entries.map((o) => [o.name, o.trades_completed]);
        return {
            headers: headers,
            entries: entries,
        };
    }

    function get_player_transactions_ratings(stats) {
        let headers = ["Name", "Txns"];
        let entries = [];
        for (const [user_id, user_stats] of Object.entries(stats)) {
            entries.push({
                name: user_id_to_name($league_info.users, user_id),
                transactions: user_stats.player_transactions,
            });
        }
        // reverse-sort to get descending order
        entries.sort((a, b) => a.transactions - b.transactions).reverse();
        entries = entries.map((o) => [o.name, o.transactions]);
        return {
            headers: headers,
            entries: entries,
        };
    }

    function get_faab_spent_ratings(stats) {
        let headers = ["Name", "FAAB"];
        let entries = [];
        for (const [user_id, user_stats] of Object.entries(stats)) {
            entries.push({
                name: user_id_to_name($league_info.users, user_id),
                faab_spent: user_stats.faab_spent,
            });
        }
        // reverse-sort to get descending order
        entries.sort((a, b) => a.faab_spent - b.faab_spent).reverse();
        entries = entries.map((o) => [o.name, `$${o.faab_spent}`]);
        return {
            headers: headers,
            entries: entries,
        };
    }
</script>

<section id="league-stats-wrapper">
    <p class="title">{get_league_name()}</p>
    <div id="stats-views-wrapper" class="hflex">
        <GameStatView
            title="MOST POINTS"
            game={matchup_stats.max_score}
            bold_winner={true}
        />
        <GameStatView
            title="LEAST POINTS"
            game={matchup_stats.min_score}
            bold_loser={true}
        />
        <GameStatView
            title="BIGGEST BLOWOUT"
            game={matchup_stats.biggest_blowout}
        />
        <GameStatView
            title="CLOSEST GAME"
            game={matchup_stats.closest_game}
        />
        <div class="grid-break"></div>
        <StatsListView
            title="WIN PERCENTAGE"
            {...get_win_pct_ratings(matchup_stats)}
        />
        <StatsListView
            title="TOTAL POINTS SCORED"
            {...get_points_scored_ratings(matchup_stats)}
        />
        <StatsListView
            title="TOTAL POINTS AGAINST"
            {...get_points_against_ratings(matchup_stats)}
        />
        <StatsListView
            title="TOTAL BENCH POINTS"
            {...get_bench_points_ratings(matchup_stats)}
        />
        <StatsListView
            title="TOTAL TRADES COMPLETED"
            {...get_trades_completed_ratings(transaction_stats)}
        />
        <StatsListView
            title="TOTAL FA/WAIVER MOVES"
            {...get_player_transactions_ratings(transaction_stats)}
        />
        <StatsListView
            title="TOTAL FAAB SPENT"
            {...get_faab_spent_ratings(transaction_stats)}
        />
    </div>
</section>

<style>
    #league-stats-wrapper {
        width: 100%;
        height: 100%;
    }

    .title {
        font-size: 24px;
        margin: 0;
        margin-bottom: 32px;
    }

    #stats-views-wrapper {
        flex-wrap: wrap;
        column-gap: 64px;
    }

    .grid-break {
        flex-basis: 100%;
        height: 0;
    }

    @media only screen and (max-width: 768px) {
        .title {
            font-size: 20px;
            margin-bottom: 16px;
        }
    }
</style>

