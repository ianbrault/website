<!--
    ToDoList.svelte
-->

<script>
    import { onMount } from "svelte";
    import { v4 as uuidv4 } from "uuid";

    import "../base.css";
    import { focusedItem } from "../stores.js";
    import { loadToDoItems, storeToDoItems } from "../storage_driver.js";
    import ToDoItem from "./ToDoItem.svelte";

    // items will be loaded from local storage on component mount
    let toDoItems = [];

    function itemIndentLevel(id) {
        for (const item of toDoItems) {
            // find the item with matching ID
            if (item.id == id) {
                return item.level;
            }
        }
        return undefined;
    }

    function addNewItem(event) {
        // re-assign to toDoItems to force the re-draw
        let newItems = [];
        let newItem = {
            id: uuidv4(),
            // FIXME: this needs to be event.detail.parentId
            // not changing yet because it will break indent
            parentId: event.detail.id,
            text: "",
            level: event.detail.level,
        };
        console.log("adding new item", newItem.id);
        // add to the list after the parent ID
        for (const item of toDoItems) {
            newItems.push(item);
            if (item.id == newItem.parentId) {
                newItems.push(newItem);
            }
        }
        toDoItems = newItems;
        // focus the new item
        focusItem(newItem.id);
        // NOTE: do not store items yet, wait until the new item is un-focused
    }

    function focusItem(id) {
        console.log("focusing item", id);
        focusedItem.set(id);
    }

    function indentItem(event) {
        // re-assign to toDoItems to force the re-draw
        let newItems = [];
        for (const item of toDoItems) {
            // find the item with matching ID and do not indent more than one
            // level more than the parent item
            // FIXME: need to handle the parent ID checking differently
            if (
                item.id == event.detail.id
                && item.level == itemIndentLevel(event.detail.parentId)
            ) {
                // FIXME: this will have a new parent after indenting
                console.log("indenting item", event.detail.id);
                item.level++;
            }
            newItems.push(item);
        }
        toDoItems = newItems;
        // store updated item state to local storage
        storeToDoItems(toDoItems);
    }

    function unindentItem(event) {
        // re-assign to toDoItems to force the re-draw
        let newItems = [];
        for (const item of toDoItems) {
            // find the item with matching ID and keep the level nonnegative
            if (item.id == event.detail.id && item.level > 0) {
                // FIXME: this will have a new parent after un-indenting
                console.log("un-indenting item", event.detail.id);
                item.level--;
            }
            newItems.push(item);
        }
        toDoItems = newItems;
        // store updated item state to local storage
        storeToDoItems(toDoItems);
    }

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

    onMount(() => {
        // load stored to-do items when the component mounts
        let items = loadToDoItems();
        if (items.length == 0) {
            // initialize with a placeholder item if there are none stored
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

