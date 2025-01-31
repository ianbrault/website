/*
** sleeper/src/components/UserLogin.tsx
*/

import React from "react";

import {
    League,
    getUserID,
    getUserCurrentLeagues
} from "../api.ts";

import Button from "../../../components/Button.tsx";
import TextInput from "../../../components/TextInput.tsx";
import LoadingBar from "./LoadingBar.tsx";

import "../styles/UserLogin.css";

interface UserLoginProps {
    setLeagues: React.Dispatch<React.SetStateAction<League[]>>;
    nextPage: () => void;
}

export default function UserLogin({ setLeagues, nextPage }: UserLoginProps) {
    const [username, setUsername] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    function onUsernameChange(text: string) {
        setUsername(text);
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        let userID: string;
        let userLeagues: League[];

        event.preventDefault();
        if (username.length == 0) {
            return;
        }
        setLoading(true);

        // get the user ID for the given username
        try {
            userID = await getUserID(username);
            console.debug(`${username} ID: ${userID}`);
        } catch {
            alert(`Failed to find user "${username}"`);
            setLoading(false);
            return;
        }

        // get the leagues data from the current year for the user
        try {
            userLeagues = await getUserCurrentLeagues(userID);
            console.debug(`${username} leagues:`, userLeagues);
        } catch {
            alert(`Failed to retrieve Sleeper leagues for ${username}`);
            setLoading(false);
            return;
        }

        setLeagues(userLeagues);
        nextPage();
    }

    return (
        <form className="user-input" onSubmit={onSubmit}>
            <TextInput
                label="Enter your username:"
                onChange={onUsernameChange}
                className="username-input"
            />
            <Button message="submit" className="user-button"/>
            <LoadingBar loading={loading}/>
        </form>
    );
}
