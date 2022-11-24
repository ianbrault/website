<!--
    ToDoList.svelte
-->

<script>
    import { onMount } from "svelte";

    import { loadToDoItems, storeToDoItems } from "../storage_driver.js";

    import ToDoItemDay from "./ToDoItemDay.svelte";
    import "../base.css";

    let items = [];

    function checkItem(id) {
        console.log(`checking to-do item ${id}`);
        // find the item and mark it as checked
        for (const itemDay of items) {
            for (const item of itemDay.items) {
                if (item.id == id) {
                    item.isChecked = true;
                }
            }
        }
        // then flush to local storage
        storeToDoItems(items);
    }

    function uncheckItem(id) {
        console.log(`un-checking to-do item ${id}`);
        // find the item and mark it as un-checked
        for (const itemDay of items) {
            for (const item of itemDay.items) {
                if (item.id == id) {
                    item.isChecked = false;
                }
            }
        }
        // then flush to local storage
        storeToDoItems(items);
    }

    function itemToggled(event) {
        if (event.detail.checked) {
            checkItem(event.detail.id);
        } else {
            uncheckItem(event.detail.id);
        }
    }

    // load stored to-do items when the component mounts
    onMount(() => {
        items = loadToDoItems();
        console.debug(items);
    });
</script>

<section id="todo-list" class="vflex">
    {#if items.length > 0}
        {#each items as item (item.id)}
            <ToDoItemDay {...item} on:toggled={itemToggled}/>
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
