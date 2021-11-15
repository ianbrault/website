<!--
    BetView.svelte
    displays user bets
-->

<script>
    import Dropdown from "./Dropdown.svelte";

    import { NBATeamFullName } from "../nba.js";
    import { NFLTeamFullName } from "../nfl.js";
    import { user_bets } from "../stores.js";
    import { post } from "../utils.js";

    let columns = [
        "Date", "Sport", "Team", "Opponent", "Line", "Odds", "Result", "Wager", "Net",
    ];

    let money_formatter = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
    });

    function dateToString(d) {
        let date = new Date(d);
        // note: month is zero-indexed
        let month = (date.getMonth() + 1).toString().padStart(2, "0");
        let day = date.getDate().toString().padStart(2, "0");
        return `${month}/${day}/${date.getFullYear()}`;
    }

    function formatLineOdds(value) {
        if (value == "ML" || value == "PK") {
            return value;
        } else if (value > 0) {
            return `+${value}`;
        } else {
            return value.toString();
        }
    }

    function betsToTable(bets) {
        let all_bets = [];

        // add NBA bets
        bets["NBA"].forEach((b) => {
            let result = (b["result"] == undefined) ? "N/A" : b["result"];
            all_bets.push({
                // include the ID for actions
                "id": b["_id"],
                "Date": dateToString(b["date"]),
                "Sport": "NBA",
                "Team": NBATeamFullName(b["team"]),
                "Opponent": NBATeamFullName(b["opponent"]),
                "Line": formatLineOdds(b["line"]),
                "Odds": formatLineOdds(b["odds"]),
                "Result": result,
                "Wager": money_formatter.format(b["wager"]),
                "Net": "N/A",  // TODO
            });
        });

        // add NFL bets
        bets["NFL"].forEach((b) => {
            let result = (b["result"] == undefined) ? "N/A" : b["result"];
            all_bets.push({
                // include the ID for actions
                "id": b["_id"],
                "Date": dateToString(b["date"]),
                "Sport": "NFL",
                "Team": NFLTeamFullName(b["team"]),
                "Opponent": NFLTeamFullName(b["opponent"]),
                "Line": formatLineOdds(b["line"]),
                "Odds": formatLineOdds(b["odds"]),
                "Result": result,
                "Wager": money_formatter.format(b["wager"]),
                "Net": "N/A",  // TODO
            });
        });

        // sort by date
        all_bets.sort((b1, b2) => {
            if (b1["Date"] < b2["Date"]) {
                return -1;
            } else if (b1["Date"] > b2["Date"]) {
                return 1;
            } else {
                return 0;
            }
        });
        return all_bets
    }

    async function editBet(sport, bet_id) {
        // TODO: implement
        console.log(`edit ${sport} bet ${bet_id}`);
    }

    async function deleteBet(sport, bet_id) {
        console.log(`delete ${sport} bet ${bet_id}`);
        let url = `/bets/${sport.toLowerCase()}/delete`;
        let res = await post(url, {bet_id: bet_id});
        if (res.status == 200) {
            // remove the bet from the store
            user_bets.update((bets) => {
                bets[sport] = bets[sport].filter((b) => b["_id"] != bet_id);
                return bets;
            })
        } else {
            alert(await res.text());
        }
    }

    async function betDropdownHandler(sport, bet_id, action) {
        if (action == "edit") {
            await editBet(sport, bet_id);
        } else if (action == "delete") {
            await deleteBet(sport, bet_id);
        }
    }
</script>

<div id="bet-view-container" class="bordered-round">
    <table>
        <thead>
            <tr>
                {#each columns as column}
                    <th>{column}</th>
                {/each}
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each betsToTable($user_bets) as bet}
                <tr>
                    {#each columns as column}
                        <td>{bet[column]}</td>
                    {/each}
                    <td>
                        <Dropdown
                            text="..."
                            onClick={(action) => betDropdownHandler(bet["Sport"], bet["id"], action)}
                        />
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    #bet-view-container {
        width: 100%;
        height: 100%;
        overflow: auto;
        border-radius: 4px;
    }

    table {
        width: 100%;
        table-layout: auto;
        border-spacing: 0;
        font-size: 14px;
        text-align: right;
    }


    table td, table th {
        border-bottom: 1px solid #aaaaaa;
    }

    table tr:last-child > td {
        border-bottom: none;
    }

    thead {
        background-color: #e0e0e0;
    }

    tbody > tr:hover {
        background-color: #eeeeee;
    }

    td, th {
        padding: 4px 12px;
    }

    th {
        font-weight: 600;
        padding-top: 8px;
        padding-bottom: 8px;
    }

    tr > th:first-child, tr > td:first-child {
        text-align: left;
    } tr > th:last-child, tr > td:last-child {
        text-align: center;
    }
</style>


