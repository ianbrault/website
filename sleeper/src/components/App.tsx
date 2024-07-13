/*
** sleeper/src/components/App.tsx
*/

import React from "react";

import { League } from "../api.ts";
import { Info } from "../utils.ts";
import LeagueSelector from "./LeagueSelector.tsx";
import LeagueStatsView from "./LeagueStatsView.tsx";
import UserLogin from "./UserLogin.tsx";

enum Page {
    Login,
    LeagueSelect,
    LeagueStats,
}

namespace Page {
    export function next(value: Page): Page {
        return value + 1;
    }
}

export default function App() {
    const [page, setPage] = React.useState<Page>(Page.Login);
    const [leagues, setLeagues] = React.useState<League[]>([]);
    const [info, setInfo] = React.useState<Info | null>(null);

    function nextPage() {
        setPage(Page.next(page));
    }

    return (
        <>
            {
                page === Page.Login &&
                <UserLogin setLeagues={setLeagues} nextPage={nextPage}/>
            }
            {
                page === Page.LeagueSelect &&
                <LeagueSelector leagues={leagues} setInfo={setInfo} nextPage={nextPage}/>
            }
            {
                page === Page.LeagueStats &&
                <LeagueStatsView info={info!}/>
            }
        </>
    );
}
