<!--
    LoginForm.svelte
    used to log in or register a user
-->

<script>
    import "./common.css";

    export let logged_in;
    export let bets;

    let username;
    let password;
    let login_error = "";

    async function post(url, body) {
        // encode the request body
        let bodyEncoded = new URLSearchParams();
        Object.keys(body).forEach((k) => {
            bodyEncoded.append(k, body[k]);
        });

        return await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: bodyEncoded,
        });
    }

    // common logic between login/register buttons
    async function handler(url) {
        let body = {
            "username": username,
            "password": password,
            "includeBets": true,
        };
        let res = await post(url, body);
        if (res.status == 200) {
            // clear any existing error
            login_error = "";
            // grab the bets for the user
            bets.set(await res.json());
            logged_in.set(true);
        } else {
            login_error = await res.text();
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

    <div class="hflex-center">
        <button on:click={loginUser}>Login</button>
        <button on:click={registerUser}>Register</button>
    </div>

    <p id="login-error">{login_error}</p>
</div>

<style>
    #login-wrapper {
        width: 100%;
        height: 100%;
    }

    #login-error {
        color: red;
    }
</style>
