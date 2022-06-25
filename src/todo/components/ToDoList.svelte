<!--
    ToDoList.svelte
-->

<script>
    import { v4 as uuidv4 } from "uuid";

    import "../base.css";
    import { focusedItem } from "../stores.js";
    import ToDoItem from "./ToDoItem.svelte";

    let toDoItems = [
        // initialize with a placeholder item
        {
            id: uuidv4(),
            parentId: undefined,
            text: "add to-do items here",
            level: 0,
        },
    ];

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
            if (
                item.id == event.detail.id
                && item.level == itemIndentLevel(event.detail.parentId)
            ) {
                console.log("indenting item", event.detail.id);
                item.level++;
            }
            newItems.push(item);
        }
        toDoItems = newItems;
    }

    function unindentItem(event) {
        // re-assign to toDoItems to force the re-draw
        let newItems = [];
        for (const item of toDoItems) {
            // find the item with matching ID and keep the level nonnegative
            if (item.id == event.detail.id && item.level > 0) {
                console.log("un-indenting item", event.detail.id);
                item.level--;
            }
            newItems.push(item);
        }
        toDoItems = newItems;
    }
</script>

<section id="todo-list" class="vflex">
    {#each toDoItems as item (item.id)}
        <ToDoItem
            on:enter={addNewItem}
            on:tab={indentItem}
            on:shifttab={unindentItem}
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

