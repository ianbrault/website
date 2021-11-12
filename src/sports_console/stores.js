/*
** stores.js
*/

import { writable } from "svelte/store";

export let user_logged_in = writable(undefined);
export let user_bets = writable([]);
