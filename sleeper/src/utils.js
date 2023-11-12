/*
** utils.js
*/

function sum(arr) {
    return arr.reduce((x, y) => x + y, 0);
}

export function user_id_to_name(user_info, user_id) {
    let match = user_info.filter((user) => user.user_id == user_id);
    if (match.length == 1) {
        return match[0].display_name;
    }
}

function roster_id_to_user_id(roster_info, roster_id) {
    return roster_info[roster_id - 1].owner_id;
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

function summarize_game_info(roster_info, team_a_info, team_b_info, year, week, matchup_id) {
    let info = {
        team_a: {},
        team_b: {},
        year: year,
        week: week,
        matchup_id: matchup_id,
    };

    // assign one of the teams to team_a and the other to team_b
    // gather team_a stats
    info.team_a.user_id = roster_id_to_user_id(roster_info, team_a_info.roster_id);
    info.team_a.starters_points = starters_points_total(team_a_info);
    info.team_a.bench_points = bench_points_total(team_a_info);
    // gather team_b stats
    info.team_b.user_id = roster_id_to_user_id(roster_info, team_b_info.roster_id);
    info.team_b.starters_points = starters_points_total(team_b_info);
    info.team_b.bench_points = bench_points_total(team_b_info);

    // assign the winner/loser and associated scores
    info.winner = (info.team_a.starters_points > info.team_b.starters_points)
        ? info.team_a.user_id
        : info.team_b.user_id;
    if (info.winner == info.team_a.user_id) {
        info.winner_score = info.team_a.starters_points;
        info.loser_score = info.team_b.starters_points;
    } else {
        info.winner_score = info.team_b.starters_points;
        info.loser_score = info.team_a.starters_points;
    }

    return info;
}

function game_info_placeholder() {
    return {
        team_a: {},
        team_b: {},
        year: 0,
        week: 0,
        matchup_id: 0,
        winner_score: 0,
        loser_score: Number.MAX_VALUE,
    };
}

export function get_game_stats(roster_info, matchup_info) {
    /*
    ** data format
    **  array:
    **      team_a:
    **          user_id
    **          starter_points
    **          bench_points
    **      team_b:
    **          user_id
    **          starter_points
    **          bench_points
    **      winner
    **      winner_score
    **      loser_score
    */
    let stats = [];
    if (!roster_info || !matchup_info) {
        return stats;
    }

    // iterate over years in order so that matchups are chronological
    let years = Object.keys(matchup_info);
    let min_year = Math.min(...years);
    let max_year = Math.max(...years);
    let n_users = roster_info.length;
    for (let year = min_year; year <= max_year; year++) {
        for (const [week, teams] of matchup_info[year].entries()) {
            // each week contains entries for each team, pair them by matchup_id
            for (let matchup_id = 1; matchup_id <= n_users / 2; matchup_id++) {
                let games = teams.filter((team) => team.matchup_id == matchup_id);
                let info = summarize_game_info(
                    roster_info, games[0], games[1], year, week, matchup_id);
                stats.push(info);
            }
        }
    }

    return stats;
}

export function get_matchup_stats(league_info) {
    /*
    ** data format
    **  users:
    **      wins
    **      losses
    **      points_for
    **      points_against
    **      bench_points
    **  max_score:
    **      game object (see get_game_stats for format)
    **  min_score:
    **      game object
    **  biggest_blowout:
    **      game object
    **  closest_game:
    **      game object
    */
    let stats = {};
    stats.max_score = game_info_placeholder();
    stats.min_score = game_info_placeholder();
    stats.biggest_blowout = game_info_placeholder();
    stats.biggest_blowout.loser_score = 0;
    stats.closest_game = game_info_placeholder();
    stats.closest_game.winner_score = Number.MAX_VALUE;
    stats.closest_game.loser_score = 0;
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

    // iterate over games info
    for (const game of league_info.games) {
        let diff = game.winner_score - game.loser_score;
        let blowout = stats.biggest_blowout.winner_score - stats.biggest_blowout.loser_score;
        let closest = stats.closest_game.winner_score - stats.closest_game.loser_score;
        // assign to user stats for team_a
        stats.users[game.team_a.user_id].points_for += game.team_a.starters_points;
        stats.users[game.team_a.user_id].points_against += game.team_b.starters_points;
        stats.users[game.team_a.user_id].bench_points += game.team_a.bench_points;
        // assign to user stats for team_b
        stats.users[game.team_b.user_id].points_for += game.team_b.starters_points;
        stats.users[game.team_b.user_id].points_against += game.team_a.starters_points;
        stats.users[game.team_b.user_id].bench_points += game.team_b.bench_points;
        // assign winner/loser stats
        let loser = game.winner == game.team_a.user_id ? game.team_b.user_id : game.team_a.user_id;
        stats.users[game.winner].wins += 1;
        stats.users[loser].losses += 1;
        // check if either score is the minimum/maximum
        if (game.winner_score > stats.max_score.winner_score) {
            stats.max_score = game;
        }
        if (game.loser_score < stats.min_score.loser_score) {
            stats.min_score = game;
        }
        if (diff > blowout) {
            stats.biggest_blowout = game;
        }
        if (diff < closest) {
            stats.closest_game = game;
        }
    }

    return stats;
}

export function get_per_user_matchup_stats(league_info) {
    // maps user IDs to objects which map opponent IDs to the number of wins against them
    let stats = {};
    // initialize with user ID permutations
    for (const user of league_info.users) {
        stats[user.user_id] = {};
        for (const uuser of league_info.users) {
            if (uuser.user_id != user.user_id) {
                stats[user.user_id][uuser.user_id] = 0;
            }
        }
    }

    // iterate over games info
    for (const game of league_info.games) {
        let loser = game.winner == game.team_a.user_id ? game.team_b.user_id : game.team_a.user_id;
        stats[game.winner][loser] += 1;
    }

    return stats;
}

function transaction_num_adds(transaction_info) {
    if (transaction_info.adds == null) {
        return 0;
    } else {
        return Object.keys(transaction_info.adds).length;
    }
}

export function get_transaction_stats(league_info) {
    /*
    ** data format
    **  trades_proposed
    **  trades_completed
    **  player_transactions (waivers + free agents)
    **  faab_spent
    */
    let stats = {};
    for (const user of league_info.users) {
        stats[user.user_id] = {
            trades_proposed: 0,
            trades_completed: 0,
            player_transactions: 0,
            faab_spent: 0,
        };
    }

    // grab transaction info
    // iterate over years in order so that matchups are chronological
    let years = Object.keys(league_info.years);
    let min_year = Math.min(...years);
    let max_year = Math.max(...years);
    for (let year = min_year; year <= max_year; year++) {
        for (const transaction of league_info.years[year].transactions) {
            if (transaction.type == "trade") {
                stats[transaction.creator].trades_proposed += 1;
                if (transaction.status == "complete") {
                    for (const roster_id of transaction.roster_ids) {
                        let user_id = roster_id_to_user_id(league_info.rosters, roster_id);
                        stats[user_id].trades_completed += 1;
                    }
                }
            }
            if (transaction.type == "free_agent" && transaction.status == "complete") {
                let roster_id = transaction.roster_ids[0];
                let user_id = roster_id_to_user_id(league_info.rosters, roster_id);
                stats[user_id].player_transactions += transaction_num_adds(transaction);
            }
            if (transaction.type == "waiver" && transaction.status == "complete") {
                let roster_id = transaction.roster_ids[0];
                let user_id = roster_id_to_user_id(league_info.rosters, roster_id);
                stats[user_id].player_transactions += transaction_num_adds(transaction);
                stats[user_id].faab_spent += transaction.settings.waiver_bid;
            }
        }
    }

    return stats;
}
