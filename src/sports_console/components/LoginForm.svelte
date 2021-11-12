<!--
    LoginForm.svelte
    used to log in or register a user
-->

<script>
    import "../common.css";
    import { user_logged_in, user_bets } from "../stores.js";
    import { post } from "../utils.js";

    let username;
    let password;
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
</script>

<div id="login-wrapper" class="vflex-center">
    <input bind:value={username} placeholder="username">
    <input type="password" bind:value={password} placeholder="password">

    <div id="login-button-wrapper" class="hflex-center">
        <button on:click={loginUser}>Login</button>
        <button on:click={registerUser}>Register</button>
    </div>

    <p id="login-error">{login_error}</p>
</div>

<style>
    #login-wrapper {
        width: 100%;
        height: 100%;
        gap: 8px;
    }

    input {
        width: 200px;
        font-size: 14px;
    }

    #login-button-wrapper {
        width: 200px;
        gap: 4px;
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
