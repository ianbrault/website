/*
** app/sleeper/[userId]/components/LeagueForm.tsx
*/

"use client";

import React, { useState } from "react";
import { redirect } from "next/navigation";

import { League } from "../../api";

import Button from "@/components/Button";
import RadioInput from "@/components/RadioInput";

import styles from "./LeagueForm.module.css";

interface LeagueFormProps {
    userId: string;
    leagues: League[];
    error: string;
}

export default function LeagueForm({ userId, leagues, error }: LeagueFormProps) {
    const [selection, setSelection] = useState("");

    function onFormSubmit() {
        redirect(`/sleeper/${userId}/${selection}`);
    }

    return (
        <form id="league-input" className={styles.leagueInput} onSubmit={onFormSubmit}>
            <label htmlFor="league-input" className={styles.leagueLabel}>Select your league:</label>
            {leagues.map((league) => (
                <RadioInput
                    key={league.id}
                    value={league.id}
                    label={league.name}
                    checked={selection === league.id}
                    onChange={setSelection}
                />
            ))}
            <Button message="Submit" className={styles.leagueButton} />
            {error.length > 0 && <p className={styles.errorText}>{error}</p>}
        </form>
    );
}
