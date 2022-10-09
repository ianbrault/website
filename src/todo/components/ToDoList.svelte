<!--
    ToDoList.svelte
-->

<script>
    import { onMount } from "svelte";
    import { editMode } from "../stores.js";
    import { loadToDoItems } from "../storage_driver.js";

    import ToDoEditArea from "./ToDoEditArea.svelte";
    import ToDoItem from "./ToDoItem.svelte";
    import "../base.css";

    // to-do items are loaded on component mount
    let toDoItems = [];

    onMount(() => {
        // load stored to-do items when the component mounts
        toDoItems = loadToDoItems();
    });
</script>

<section id="todo-list" class="vflex">
    {#if $editMode}
        <ToDoEditArea/>
    {:else if toDoItems.length > 0}
        {#each toDoItems as item (item.id)}
            <ToDoItem {...item}/>
        {/each}
    {:else}
        <p>nothing here yet...</p>
    {/if}
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

