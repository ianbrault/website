<!--
    UserLogin.svelte
    component used to retrieve user info
-->

<script>
    import "../base.css";
    import {
        getUser,
        getUserCurrentLeagues,
    } from "../api.js";
    import {
        loadingSpinner,
        userLeagues,
    } from "../stores.js";

    let usernameInput;

    async function onSubmit(event) {
        event.preventDefault();
        loadingSpinner.set(true);

        // get the user data for the given username
        let username = usernameInput.value;
        console.log(`searching for user ${username}`);
        let userData = await getUser(username);
        if (userData) {
            // get the leagues data from the current year for the user
            console.log(`searching for leagues for user ${userData.user_id}`);
            let userLeagueData = await getUserCurrentLeagues(userData.user_id);
            if (userLeagueData) {
                userLeagues.set(userLeagueData);
            }
        } else {
            alert(`failed to find user "${username}"`);
        }
        loadingSpinner.set(false);
    }
</script>

<form id="user-input" class="vflex" on:submit={onSubmit}>
    <label for="username">Enter your username:</label>
    <input type="text" id="username-input" required bind:this={usernameInput}>
    <button id="user-button">submit</button>
</form>

<style>
    #user-input {
        font-size: 14px;
        justify-content: flex-start;
        gap: 8px;
    }

    #username-input {
        width: 256px;
    }

    #user-button {
        align-self: center;
        padding: 2px 16px;
        margin: 4px;
    }
</style>

