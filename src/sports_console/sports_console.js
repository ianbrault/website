/*
** src/sports_console/sports_console.js
*/

import "../css/base.css";

import App from "./App.svelte";

const app = new App({
    target: document.body,
    props: {
        name: "world"
    }
});

export default app;
