/*
** app/sleeper/page.tsx
*/

"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { getUserID } from "./api";

import Button from "@/components/Button";
import LoadingBar from "./components/LoadingBar";
import TextInput from "@/components/TextInput";

import styles from "./page.module.css";

export default function Sleeper() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (username.length === 0) {
            return;
        }
        setLoading(true);

        // get the user ID for with the given username
        try {
            const userId = await getUserID(username);
            if (userId == null) {
                setLoading(false);
                setError(`Failed to find user "${username}"`);
            } else {
                router.push(`/sleeper/${userId}`);
            }
        } catch {
            setLoading(false);
            setError(`Failed to find user "${username}"`);
        }
    }

    return (
        <form className={styles.userInput} onSubmit={onSubmit}>
            <TextInput
                className={styles.usernameInput}
                label="Enter your username:"
                onChange={setUsername}
            />
            <Button className={styles.userButton} message="Submit"/>
            <LoadingBar loading={loading}/>
            {error.length > 0 && <p className={styles.errorText}>{error}</p>}
        </form>
    );
}
