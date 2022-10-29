<!--
    UserLogin.svelte
    component used to retrieve user info
-->

<script>
    import "../base.css";
    import {
        get_user,
        get_user_current_leagues,
    } from "../api.js";
    import {
        loading_spinner,
        user_leagues,
    } from "../stores.js";

    let username_input;

    async function on_submit(event) {
        event.preventDefault();
        loading_spinner.set(true);

        // get the user data for the given username
        let username = username_input.value;
        console.log(`searching for user ${username}`);
        let user_data = await get_user(username);
        if (user_data) {
            // get the leagues data from the current year for the user
            console.log(`searching for leagues for user ${user_data.user_id}`);
            let user_league_data = await get_user_current_leagues(user_data.user_id);
            if (user_league_data) {
                user_leagues.set(user_league_data);
            }
        } else {
            alert(`failed to find user "${username}"`);
        }
        loading_spinner.set(false);
    }
</script>

<form id="user-input" class="vflex" on:submit={on_submit}>
    <label for="username">Enter your username:</label>
    <input type="text" id="username-input" required bind:this={username_input}>
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

