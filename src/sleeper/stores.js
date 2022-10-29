/*
** stores.js
*/

import { writable } from "svelte/store";

export const loading_spinner = writable(false);
export const loading_progress = writable(false);
export const user_leagues = writable(null);
export const num_queries = writable(0);
export const curr_query = writable(0);
export const league_info = writable(null);

