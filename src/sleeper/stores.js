/*
** stores.js
*/

import { writable } from "svelte/store";

export const loading = writable(false);
export const userInfo = writable(null);
export const currentLeaguesInfo = writable(null);
export const leagueAllInfo = writable(null);

