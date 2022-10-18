/*
** stores.js
*/

import { writable } from "svelte/store";

export const editMode = writable(false);
export const toDoItems = writable([]);

