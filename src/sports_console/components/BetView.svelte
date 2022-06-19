<!--
    BetView.svelte
    displays user bets
-->

<script>
    import Dropdown from "./Dropdown.svelte";

    import { F1DriverTeams, F1TeamLogos } from "../f1.js";
    import { NBATeamFullName } from "../nba.js";
    import { NCAALogos } from "../ncaa.js";
    import { NFLTeamFullName } from "../nfl.js";
    import { user_bets } from "../stores.js";
    import { post } from "../utils.js";

    let columns = [
        // note: the logo column header will not be shown
        "Date", "Logo", "Details", "Line", "Odds", "Result", "Wager", "Net",
    ];

    let money_formatter = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
    });

    function colClass(col, header) {
        return `table-${header ? "header-" : ""}col ${col.toLowerCase()}-col`;
    }

    function dateToString(d) {
        let date = new Date(d);
        // note: month is zero-indexed
        let month = (date.getMonth() + 1).toString().padStart(2, "0");
        let day = date.getDate().toString().padStart(2, "0");
        return `${month}/${day}/${date.getFullYear()}`;
    }

    function formatLineOdds(value) {
        if (value == null || value == undefined) {
            return "";
        } else if (value == "ML" || value == "PK") {
            return value;
        } else if (typeof value == "number" && value > 0) {
            return `+${value}`;
        } else {
            return value.toString();
        }
    }

    function getF1Logo(driver, date) {
        let placeholder = "/img/logos/f1/F1.svg";

        let d = new Date(date);
        let year = d.getFullYear().toString();

        if (driver in F1DriverTeams[year]) {
            return F1TeamLogos[F1DriverTeams[year][driver]];
        } else {
            return placeholder;
        }
    }

    function getNCAALogo(sport, team) {
        if (team in NCAALogos) {
            return NCAALogos[team];
        } else if (sport == "NCAAF") {
            return "/img/logos/football.svg";
        } else if (sport == "NCAAMBB") {
            return "/img/logos/basketball.svg";
        }
    }

    function logoClass(src) {
        // shrink the placeholder icons
        if (src.endsWith("basketball.svg") || src.endsWith("football.svg")) {
            return "team-logo-placeholder";
        } else {
            return "team-logo";
        }
    }

    function betsToTable(bets) {
        let all_bets = [];

        // add F1 bets
        bets["F1"].forEach((b) => {
            let result = (b["result"] == undefined) ? "N/A" : b["result"];
            all_bets.push({
                "id": b["_id"],
                "Date": dateToString(b["date"]),
                "Sport": "F1",
                "Logo": getF1Logo(b["driver"], b["date"]),
                "Details": `${b["driver"]} (${b["event"]})`,
                "Line": formatLineOdds(b["line"]),
                "Odds": formatLineOdds(b["odds"]),
                "Result": result,
                "Wager": money_formatter.format(b["wager"]),
                "Net": "N/A",  // TODO
            });
        });

        // add NBA bets
        bets["NBA"].forEach((b) => {
            let result = (b["result"] == undefined) ? "N/A" : b["result"];
            all_bets.push({
                "id": b["_id"],
                "Date": dateToString(b["date"]),
                "Sport": "NBA",
                "Logo": `/img/logos/nba/${b["team"]}.svg`,
                "Details": `${NBATeamFullName(b["team"])} (vs. ${b["opponent"]})`,
                "Line": formatLineOdds(b["line"]),
                "Odds": formatLineOdds(b["odds"]),
                "Result": result,
                "Wager": money_formatter.format(b["wager"]),
                "Net": "N/A",  // TODO
            });
        });

        // add NCAAF bets
        bets["NCAAF"].forEach((b) => {
            let result = (b["result"] == undefined) ? "N/A" : b["result"];
            all_bets.push({
                "id": b["_id"],
                "Date": dateToString(b["date"]),
                "Sport": "NCAAF",
                "Logo": getNCAALogo("NCAAF", b["team"]),
                "Details": `${b["team"]} (vs. ${b["opponent"]})`,
                "Line": formatLineOdds(b["line"]),
                "Odds": formatLineOdds(b["odds"]),
                "Result": result,
                "Wager": money_formatter.format(b["wager"]),
                "Net": "N/A",  // TODO
            });
        });

        // add NCAAMBB bets
        bets["NCAAMBB"].forEach((b) => {
            let result = (b["result"] == undefined) ? "N/A" : b["result"];
            all_bets.push({
                "id": b["_id"],
                "Date": dateToString(b["date"]),
                "Sport": "NCAAMBB",
                "Logo": getNCAALogo("NCAAMBB", b["team"]),
                "Details": `${b["team"]} (vs. ${b["opponent"]})`,
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
                "id": b["_id"],
                "Date": dateToString(b["date"]),
                "Sport": "NFL",
                "Logo": `/img/logos/nfl/${b["team"]}.svg`,
                "Details": `${NFLTeamFullName(b["team"])} (vs. ${b["opponent"]})`,
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
    <div id="bet-table">
        <div class="table-header">
            {#each columns as column}
                <div class={colClass(column, true)}>
                    {(column != "Logo") ? column : ""}
                </div>
            {/each}
            <div class={colClass("Actions", true)}>Actions</div>
        </div>
        {#each betsToTable($user_bets) as bet}
            <div class="table-row">
                {#each columns as column}
                    <div class={colClass(column, false)}>
                        {#if column == "Logo"}
                            <img class={logoClass(bet[column])} src={bet[column]} alt="team logo">
                        {:else}
                            {bet[column]}
                        {/if}
                    </div>
                {/each}
                <div class={colClass("Actions", false)}>
                    <Dropdown
                        text="..."
                        onClick={(action) => betDropdownHandler(bet["Sport"], bet["id"], action)}
                    />
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    #bet-view-container {
        width: 100%;
        height: 100%;
        overflow: auto;
        border-radius: 4px;
    }

    #bet-table {
        width: 100%;
        font-size: 13px;
    }

    .table-header, .table-row {
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: center;
    }

    .table-header {
        border-bottom: 1px solid #888888;
        background-color: rgb(233, 233, 237);
    }

    .table-row {
        height: 30px;
        border-bottom: 1px solid #bbbbbb;
    } .table-row:hover {
        background-color: rgb(233, 233, 237);
    }

    .table-col, .table-header-col {
        padding-left: 12px;
        padding-right: 12px;
    }

    .table-header-col {
        font-weight: 600;
        padding-top: 8px;
        padding-bottom: 8px;
    }

    .table-col {
        padding-top: 6px;
        padding-bottom: 6px;
    }

    .date-col {
        width: 8%;
    } .logo-col {
        width: 50px;
    }.details-col {
        flex-grow: 1;
    } .line-col, .odds-col, .result-col {
        width: 6%;
    } .wager-col, .net-col {
        width: 8%;
    } .actions-col {
        width: 10%;
    }

    .line-col, .odds-col, .result-col, .wager-col, .net-col {
        text-align: right;
    } .actions-col {
        text-align: center;
    }

    .logo-col {
        display: flex;
        justify-content: center;
        align-items: center;
        padding-right: 2px;
        padding-top: 0;
        padding-bottom: 0;
    }

    .team-logo {
        width: 36px;
        max-height: 32px;
    } .team-logo-placeholder {
        width: 28px;
        max-height: 24px;
    }
</style>


