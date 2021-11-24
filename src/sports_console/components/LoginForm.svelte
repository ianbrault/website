<!--
    LoginForm.svelte
    used to log in or register a user
-->

<script>
    import "../common.css";

    import { onMount } from "svelte";

    import { user_logged_in, user_bets } from "../stores.js";
    import { post } from "../utils.js";

    let username;
    let password;
    let username_input;
    let login_error = "";

    // common logic between login/register buttons
    async function handler(url) {
        let body = {
            "username": username,
            "password": password,
            "includeBets": true,
        };
        let res = await post(url, body);
        if (res.status == 200) {
            body = await res.json();
            // clear any existing error
            login_error = "";
            // grab the user ID and bets
            user_bets.set(body["bets"]);
            user_logged_in.set(body["user"]);
            console.log(`logged in user ${body["user"]}`);
        } else {
            let err = await res.text();
            login_error = `error: ${err}`;
        }
    }

    async function loginUser() {
        await handler("/user/login");
    }

    async function registerUser() {
        await handler("/user/register");
    }

    // auto-focus the username input
    onMount(() => {
        username_input.focus();
    });
</script>

<form id="login-wrapper" class="vflex-center" on:submit|preventDefault={loginUser}>
    <input bind:value={username} bind:this={username_input} placeholder="username">
    <input type="password" bind:value={password} placeholder="password">

    <div id="login-button-wrapper" class="hflex-center">
        <button type="submit" on:click={loginUser}>Login</button>
        <button on:click={registerUser}>Register</button>
    </div>

    <p id="login-error">{login_error}</p>
</form>

<style>
    #login-wrapper {
        width: 100%;
        height: 100%;
        gap: 8px;
    }

    input {
        width: 200px;
        padding: 2px;
        font-size: 14px;
    }

    #login-button-wrapper {
        width: 200px;
        gap: 8px;
    }

    button {
        flex: 1 1 0px;
        /* flex-grow: 1; */
        padding: 2px;
        font-size: 13px;
    }

    #login-error {
        color: red;
        font-size: 13px;
        font-weight: bold;
    }
</style>
