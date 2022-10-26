/*
** stores.js
*/

import { writable } from "svelte/store";

export const loadingSpinner = writable(false);
export const loadingProgress = writable(false);
export const userLeagues = writable(null);
export const numQueries = writable(0);
export const currQuery = writable(0);
export const leagueInfo = writable(null);

