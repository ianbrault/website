/*
** sleeper/src/components/LeagueSelector.tsx
*/

import React from "react";

import { League } from "../api.ts";
import { Info, getLeagueStats } from "../utils.ts";
import LoadingBar from "./LoadingBar.tsx";
import "../styles/LeagueSelector.css";

interface LeagueSelectorProps {
    leagues: League[];
    setInfo: React.Dispatch<React.SetStateAction<Info | null>>;
    nextPage: () => void;
}

export default function LeagueSelector({ leagues, setInfo, nextPage }: LeagueSelectorProps) {
    const [selectedLeague, setSelectedLeague] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    function onLeagueSelectedChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSelectedLeague(event.target.value);
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (selectedLeague.length == 0) {
            return;
        }
        setLoading(true);

        try {
            const info = await getLeagueStats(selectedLeague);
            setInfo(info);
            nextPage();
        } catch(error) {
            alert(`Failed to find league: ${error.message}`);
            setLoading(false);
        }
    }

    const inputs = leagues.map((league) => {
        return (
            <label key={league.id}>
                <input
                    type="radio"
                    value={league.id}
                    checked={selectedLeague === league.id}
                    onChange={onLeagueSelectedChange}
                />
                {league.name}
            </label>
        );
    });
    return (
        <form id="league-input" className="league-input" onSubmit={onSubmit}>
            <label htmlFor="league-input">Select your league:</label>
            {inputs}
            <button className="league-button">submit</button>
            <LoadingBar loading={loading}/>
        </form>
    );
}