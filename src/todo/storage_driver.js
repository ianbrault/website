/*
** storage_driver.js
*/

const ToDoItemsKey = "toDoItems";

export function loadToDoItems() {
    let itemData = localStorage.getItem(ToDoItemsKey);
    // parse the items into an Object
    let items = [];
    if (itemData) {
        items = JSON.parse(itemData);
    }
    console.log(`loaded ${items.length} to-do items`);
    return items;
}

export function storeToDoItems(items) {
    console.log(`storing ${items.length} to-do items into local storage`);
    localStorage.setItem(ToDoItemsKey, JSON.stringify(items));
}

