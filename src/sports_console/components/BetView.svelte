<!--
    BetView.svelte
    displays user bets
-->

<script>
    import { user_bets } from "../stores.js";

    let columns = [
        "Date", "Sport", "Team", "Opponent", "Line", "Odds", "Wager", "Result",
    ];

    function dateToString(d) {
        let date = new Date(d);
        // note: month is zero-indexed
        let month = (date.getMonth() + 1).toString().padStart(2, "0");
        let day = date.getDate().toString().padStart(2, "0");
        return `${month}/${day}/${date.getFullYear()}`;
    }

    function betsToTable(bets) {
        let all_bets = [];

        // add NBA bets
        bets["NBA"].forEach((b) => {
            all_bets.push({
                "Date": dateToString(b["date"]),
                "Sport": "NBA",
                "Team": b["team"],
                "Opponent": b["opponent"],
                "Line": b["line"],
                "Odds": b["odds"],
                "Wager": b["wager"],
                "Result": b["result"],
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

<div id="bet-view-container" class="bordered-round">
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
        flex-grow: 1;
    }

    table {
        table-layout: auto;
        width: 100%;
    }
</style>


