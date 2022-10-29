<!--
    LeagueStatsView.svelte
    displays a progress bar for the API queries
-->

<script>
    import "../base.css";
    import { league_info } from "../stores.js";
    import { get_matchup_stats, user_id_to_name } from "../utils.js";

    import StatsListView from "./StatsListView.svelte";

    let matchup_stats = get_matchup_stats($league_info);
    // FIXME: DEBUG
    console.log($league_info);
    console.log(matchup_stats);

    let win_pct_headers = ["Name", "W", "L", "Pct"];
    let points_scored_headers = ["Name", "PF"];
    let points_against_headers = ["Name", "PA"];
    let bench_points_headers = ["Name", "Pts"];

    function get_league_name() {
        let current_year = new Date().getFullYear();
        return $league_info.years[current_year].info.name;
    }

    function get_win_pct_ratings(stats) {
        let win_pct_entries = [];
        for (const [user_id, user_stats] of Object.entries(stats.users)) {
            win_pct_entries.push({
                name: user_id_to_name($league_info, user_id),
                wins: user_stats.wins,
                losses: user_stats.losses,
                win_pct: (user_stats.wins / (user_stats.wins + user_stats.losses)) * 100,
                // include points_for so that it can be used as a tiebreaker
                points_for: user_stats.points_for,
            });
        }
        // reverse-sort to get descending order
        win_pct_entries.sort((a, b) => {
            if (a.wins == b.wins) {
                // use points_for to break ties
                return a.points_for - b.points_for;
            } else {
                return a.wins - b.wins;
            }
        }).reverse();
        // transform into the expected StatsListView format
        return win_pct_entries.map((o) => {
            return [o.name, o.wins, o.losses, `${o.win_pct.toFixed(1)}%`];
        });
    }

    function get_points_scored_ratings(stats) {
        let points_scored_entries = [];
        for (const [user_id, user_stats] of Object.entries(stats.users)) {
            points_scored_entries.push({
                name: user_id_to_name($league_info, user_id),
                points_for: user_stats.points_for,
            });
        }
        // reverse-sort to get descending order
        points_scored_entries.sort((a, b) => a.points_for - b.points_for).reverse();
        return points_scored_entries.map((o) => [o.name, o.points_for.toFixed(2)]);
    }

    function get_points_against_ratings(stats) {
        let points_against_entries = [];
        for (const [user_id, user_stats] of Object.entries(stats.users)) {
            points_against_entries.push({
                name: user_id_to_name($league_info, user_id),
                points_against: user_stats.points_against,
            });
        }
        points_against_entries.sort((a, b) => a.points_against - b.points_against);
        return points_against_entries.map((o) => [o.name, o.points_against.toFixed(2)]);
    }

    function get_bench_points_ratings(stats) {
        let bench_points_entries = [];
        for (const [user_id, user_stats] of Object.entries(stats.users)) {
            bench_points_entries.push({
                name: user_id_to_name($league_info, user_id),
                bench_points: user_stats.bench_points,
            });
        }
        // reverse-sort to get descending order
        bench_points_entries.sort((a, b) => a.bench_points - b.bench_points).reverse();
        return bench_points_entries.map((o) => [o.name, o.bench_points.toFixed(2)]);
    }
</script>

<section id="league-stats-wrapper">
    <p class="title">{get_league_name()}</p>
    <div id="stats-views-wrapper" class="hflex">
        <StatsListView
            title="WIN PERCENTAGE"
            headers={win_pct_headers}
            entries={get_win_pct_ratings(matchup_stats)}
        />
        <StatsListView
            title="TOTAL POINTS SCORED"
            headers={points_scored_headers}
            entries={get_points_scored_ratings(matchup_stats)}
        />
        <StatsListView
            title="TOTAL POINTS AGAINST"
            headers={points_against_headers}
            entries={get_points_against_ratings(matchup_stats)}
        />
        <StatsListView
            title="TOTAL BENCH POINTS"
            headers={bench_points_headers}
            entries={get_bench_points_ratings(matchup_stats)}
        />
    </div>
</section>

<style>
    #league-stats-wrapper {
        width: 100%;
        height: 100%;
    }

    .title {
        font-size: 20px;
        margin-bottom: 32px;
    }

    #stats-views-wrapper {
        flex-wrap: wrap;
        gap: 64px;
    }
</style>

