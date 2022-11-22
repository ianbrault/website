/*
** storage_driver.js
*/

import { Item } from "./Item.js";

const ToDoItemsKey = "toDoItems";

export function loadToDoItems() {
    let itemData = localStorage.getItem(ToDoItemsKey);
    // parse the items into an Object
    let items = [];
    if (itemData) {
        let itemObjects = JSON.parse(itemData);
        items = itemObjects.map(obj => Item.fromJSON(obj));
    }
    console.log(`loaded ${items.length} to-do items from local storage`);
    return items;
}

export function storeToDoItems(items) {
    console.log(`storing ${items.length} to-do items into local storage`);
    let itemObjects = items.map(item => item.toJSON());
    localStorage.setItem(ToDoItemsKey, JSON.stringify(itemObjects));
}

