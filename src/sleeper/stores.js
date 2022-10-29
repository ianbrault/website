/*
** stores.js
*/

import { writable } from "svelte/store";

export const loading = writable(false);
export const user_leagues = writable(null);
export const league_info = writable(null);

