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
        { id: uuidv4(), text: "add to-do items here" },
    ];

    function focusItem(id) {
        focusedItem.set(id);
    }

    function addNewItem(_event) {
        // add a new item with no text and focus the input
        // spread syntax to trigger reactivity
        let id = uuidv4();
        toDoItems = [...toDoItems, { id: id, text: "" }];
        focusItem(id);
    }
</script>

<section id="todo-list" class="vflex">
    {#each toDoItems as item (item.id)}
        <ToDoItem on:enter={addNewItem} {...item}/>
    {/each}
</section>

<style>
    #todo-list {
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        padding: 32px;
    }
</style>

