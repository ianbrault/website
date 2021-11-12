<!--
    BetView.svelte
    displays user bets
-->

<script>
    import { teamFullName } from "../nba.js";
    import { user_bets } from "../stores.js";

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
        if (value > 0) {
            return `+${value}`;
        } else {
            return value.toString();
        }
    }

    function betsToTable(bets) {
        let all_bets = [];

        // add NBA bets
        bets["NBA"].forEach((b) => {
            console.log(`bet: ${JSON.stringify(b)}`);
            let result = (b["result"] == undefined) ? "N/A" : b["result"];
            all_bets.push({
                "Date": dateToString(b["date"]),
                "Sport": "NBA",
                "Team": teamFullName(b["team"]),
                "Opponent": teamFullName(b["opponent"]),
                "Line": formatLineOdds(b["line"]),
                "Odds": formatLineOdds(b["odds"]),
                "Result": result,
                "Wager": money_formatter.format(b["wager"]),
                "Net": "N/A",  // TODO
            });
        });

        // TODO: add remaining sports

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
</script>

<div id="bet-view-container">
    <table>
        <thead>
            <tr>
                {#each columns as column}
                    <th>{column}</th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each betsToTable($user_bets) as bet}
                <tr>
                    {#each columns as column}
                        <td>{bet[column]}</td>
                    {/each}
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
        border: 1px solid #888888;
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
    }
</style>


