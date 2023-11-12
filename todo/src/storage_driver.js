/*
** storage_driver.js
*/

import { ItemDay } from "./ItemDay.js";

const ToDoItemsKey = "toDoItems";

export function loadToDoItems() {
    const itemData = localStorage.getItem(ToDoItemsKey);
    // parse the items into an Object
    let items = [];
    if (itemData) {
        const itemObjects = JSON.parse(itemData);
        items = itemObjects.map(obj => ItemDay.fromJSON(obj));
    }
    console.log("loaded to-do items from local storage");
    return items;
}

export function storeToDoItems(items) {
    console.log("storing to-do items into local storage");
    const itemObjects = items.map(item => item.toJSON());
    localStorage.setItem(ToDoItemsKey, JSON.stringify(itemObjects));
}

