/*
** utils.js
*/

function sum(arr) {
    return arr.reduce((x, y) => x + y, 0);
}

export function user_id_to_name(league_info, user_id) {
    let match = league_info.users.filter((user) => user.user_id == user_id);
    if (match.length == 1) {
        return match[0].display_name;
    }
}

function roster_id_to_league_id(league_info, roster_id) {
    return league_info.rosters[roster_id - 1].owner_id;
}

function starters_points_total(game_info) {
    return sum(game_info.starters_points);
}

function bench_points_total(game_info) {
    let total = 0;
    for (const [player, score] of Object.entries(game_info.players_points)) {
        if (!game_info.starters.includes(player)) {
            total += score;
        }
    }
    return total;
}

export function get_matchup_stats(league_info) {
    /*
    ** data format
    **  max_score:
    **      score
    **      year
    **      week
    **      matchup_id
    **  min_score:
    **      score
    **      year
    **      week
    **      matchup_id
    **  users:
    **      wins
    **      losses
    **      points_for
    **      points_against
    **      bench_points
    */
    let stats = {};
    stats.max_score = {
        score: 0,
        year: 0,
        week: 0,
    }
    stats.min_score = {
        score: Number.MAX_VALUE,
        year: 0,
        week: 0,
    }
    stats.users = {};
    for (const user of league_info.users) {
        stats.users[user.user_id] = {
            wins: 0,
            losses: 0,
            points_for: 0,
            points_against: 0,
            bench_points: 0,
        };
    }

    // grab matchup info
    // iterate over years in order so that matchups are chronological
    let years = Object.keys(league_info.years);
    let min_year = Math.min(...years);
    let max_year = Math.max(...years);
    let n_users = league_info.users.length;
    for (let year = min_year; year <= max_year; year++) {
        for (const [week, teams] of league_info.years[year].matchups.entries()) {
            // each week contains entries for each team, pair them by matchup_id
            for (let matchup_id = 1; matchup_id <= n_users / 2; matchup_id++) {
                let games = teams.filter((team) => team.matchup_id == matchup_id);
                // assign one of the teams to team_a and the other to team_b
                // gather team_a stats
                let team_a_id = roster_id_to_league_id(league_info, games[0].roster_id);
                let team_a_starters_points = starters_points_total(games[0]);
                let team_a_bench_points = bench_points_total(games[0]);
                // gather team_b stats
                let team_b_id = roster_id_to_league_id(league_info, games[1].roster_id);
                let team_b_starters_points = starters_points_total(games[1]);
                let team_b_bench_points = bench_points_total(games[1]);
                // assign to user stats for team_a
                stats.users[team_a_id].points_for += team_a_starters_points;
                stats.users[team_a_id].points_against += team_b_starters_points;
                stats.users[team_a_id].bench_points += team_a_bench_points;
                // assign to user stats for team_a
                stats.users[team_b_id].points_for += team_b_starters_points;
                stats.users[team_b_id].points_against += team_a_starters_points;
                stats.users[team_b_id].bench_points += team_b_bench_points;
                // check for the winner
                if (team_a_starters_points > team_b_starters_points) {
                    stats.users[team_a_id].wins += 1;
                    stats.users[team_b_id].losses += 1;
                } else {
                    stats.users[team_b_id].wins += 1;
                    stats.users[team_a_id].losses += 1;
                }
                // check if either score is the minimum/maximum
                let winner_score = Math.max(team_a_starters_points, team_b_starters_points);
                let loser_score = Math.min(team_a_starters_points, team_b_starters_points);
                if (winner_score > stats.max_score.score) {
                    stats.max_score = {
                        score: winner_score,
                        year: year,
                        week: week,
                        matchup_id: matchup_id,
                    };
                }
                if (loser_score < stats.min_score.score) {
                    stats.min_score = {
                        score: loser_score,
                        year: year,
                        week: week,
                        matchup_id: matchup_id,
                    };
                }
            }
        }
    }

    return stats;
}
