/*
** sleeper/src/components/LeagueSelector.tsx
*/

import React from "react";

import { League } from "../api.ts";
import { Info, getLeagueStats } from "../utils.ts";

import Button from "../../../components/Button.tsx";
import RadioInput from "../../../components/RadioInput.tsx";
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

    function onLeagueSelectedChange(selection: string) {
        setSelectedLeague(selection);
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
            <RadioInput
                key={league.id}
                value={league.id}
                label={league.name}
                checked={selectedLeague === league.id}
                onChange={onLeagueSelectedChange}
            />
        );
    });
    return (
        <form id="league-input" className="league-input" onSubmit={onSubmit}>
            <label htmlFor="league-input">Select your league:</label>
            {inputs}
            <Button message="submit" className="league-button"/>
            <LoadingBar loading={loading}/>
        </form>
    );
}