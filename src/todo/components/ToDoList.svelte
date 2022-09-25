<!--
    ToDoList.svelte
-->

<script>
    import { onMount } from "svelte";

    import "../base.css";
    import { Item } from "../Item.js";
    import { focusedItem } from "../stores.js";
    import { loadToDoItems, storeToDoItems } from "../storage_driver.js";

    import ToDoItem from "./ToDoItem.svelte";

    // items will be loaded from local storage on component mount
    let toDoItems = [];

    // TODO: will no longer be valid with the new data format
    function itemIndex(id) {
        for (let i = 0; i < toDoItems.length; i++) {
            if (toDoItems[i].id == id) {
                return i;
            }
        }
        return undefined;
    }

    // TODO: will no longer be valid with the new data format
    function addNewItem(event) {
        // re-assign to toDoItems to force the re-draw
        let newItems = [];
        let newItem = Item.newItem("", event.detail.level);
        console.log("adding new item", newItem.id);
        // add to the list after the item
        for (const item of toDoItems) {
            newItems.push(item);
            if (item.id == event.detail.id) {
                newItems.push(newItem);
            }
        }
        toDoItems = newItems;
        // focus the new item
        focusItem(newItem.id);
        // NOTE: do not store items yet, wait until the new item is un-focused
    }

    function focusItem(id, focusEnd = false) {
        console.log("focusing item", id);
        focusedItem.set({ id: id, focusEnd: focusEnd });
    }

    // TODO: will no longer be valid with the new data format
    function indentItem(event) {
        // re-assign to toDoItems to force the re-draw
        let newItems = [];
        // first check if the item can be indented: if it is already indented
        // from the previous item, do not allow it to be indented further
        let i = itemIndex(event.detail.id);
        if (i == 0 || toDoItems[i].level > toDoItems[i - 1].level) {
            return;
        }
        for (const item of toDoItems) {
            // find the item with matching ID
            if (item.id == event.detail.id) {
                console.log("indenting item", event.detail.id);
                item.level++;
            }
            newItems.push(item);
        }
        toDoItems = newItems;
        // store updated item state to local storage
        storeToDoItems(toDoItems);
    }

    // TODO: will no longer be valid with the new data format
    function unindentItem(event) {
        // re-assign to toDoItems to force the re-draw
        let newItems = [];
        // first check if the item can be un-indented: just ensure that it
        // will end up with a non-negative level
        if (event.detail.level == 0) {
            return;
        }
        for (const item of toDoItems) {
            // find the item with matching ID
            if (item.id == event.detail.id) {
                console.log("un-indenting item", event.detail.id);
                item.level--;
            }
            newItems.push(item);
        }
        toDoItems = newItems;
        // store updated item state to local storage
        storeToDoItems(toDoItems);
    }

    // TODO: will no longer be valid with the new data format
    function itemUpdated(event) {
        // re-assign to toDoItems to force the re-draw
        let newItems = [];
        for (const item of toDoItems) {
            // find the item with matching ID
            if (item.id == event.detail.id) {
                console.log("updating item", event.detail.id);
                item.text = event.detail.text;
                // TODO: update other fields?
            }
            newItems.push(item);
        }
        toDoItems = newItems;
        // store updated item state to local storage
        storeToDoItems(toDoItems);
    }

    // TODO: will no longer be valid with the new data format
    function deleteItem(event) {
        // re-assign to toDoItems to force the re-draw
        let newItems = [];
        let i = itemIndex(event.detail.id);
        for (const item of toDoItems) {
            // skip the deleted item
            if (item.id == event.detail.id) {
                console.log("deleting item", event.detail.id);
                continue;
            }
            newItems.push(item);
        }
        toDoItems = newItems;
        // focus the previous item
        if (i && i > 0) {
            focusItem(toDoItems[i - 1].id, true);
        }
        // store updated item state to local storage
        storeToDoItems(toDoItems);
    }

    onMount(() => {
        // load stored to-do items when the component mounts
        let items = loadToDoItems();
        if (items.length == 0) {
            // initialize with a placeholder item if there are none stored
            // TODO: will no longer be valid with the new data format
            items = [{
                id: uuidv4(),
                parentId: undefined,
                text: "add to-do items here",
                level: 0,
            }];
        }
        toDoItems = items;
    });
</script>

<section id="todo-list" class="vflex">
    {#each toDoItems as item (item.id)}
        <ToDoItem
            on:enter={addNewItem}
            on:tab={indentItem}
            on:shifttab={unindentItem}
            on:update={itemUpdated}
            on:delete={deleteItem}
            {...item}
        />
    {/each}
</section>

<style>
    #todo-list {
        flex-grow: 1;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
    }
</style>

