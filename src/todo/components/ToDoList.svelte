<!--
    ToDoList.svelte
-->

<script>
    import { onMount } from "svelte";

    import { loadToDoItems } from "../storage_driver.js";

    import ToDoItem from "./ToDoItem.svelte";
    import "../base.css";

    let items = [];

    // load stored to-do items when the component mounts
    onMount(() => {
        console.log("ToDoList:onMount");
        items = loadToDoItems();
    });
</script>

<section id="todo-list" class="vflex">
    {#if items.length > 0}
        {#each items as item (item.id)}
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
        padding-top: 10px;
    }
</style>

