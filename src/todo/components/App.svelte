<!--
    App.svelte
    main application component
-->

<script>
    import { ItemDay } from "../ItemDay.js";
    import { loadToDoItems, storeToDoItems } from "../storage_driver.js";
    import { editMode } from "../stores.js";

    import IconButton from "./IconButton.svelte";
    import ToDoEditArea from "./ToDoEditArea.svelte";
    import ToDoList from "./ToDoList.svelte";
    import "../base.css";
    import { Item } from "../Item.js";

    // modify the key variable to force a re-render
    let key = 0;

    function rerender() {
        key++;
    }

    function setEditMode() {
        editMode.set(true);
    }

    function unsetEditMode() {
        editMode.set(false);
    }

    function advanceDay() {
        let items = loadToDoItems();
        // grab the most recent day
        let day = items.pop();
        // increment the date
        let nextDay = new Date(day.date.getTime() + 86400000);  // +1 day in ms
        // assign completed items to the current day and incomplete items to
        // the next day
        let curr = [];
        let next = [];
        for (const item of day.items) {
            if (item.isChecked) {
                curr.push(item);
            } else {
                next.push(item);
            }
        }
        // skip the current day if there are no completed items
        if (curr.length > 0) {
            items.push(new ItemDay(day.date, curr, day.id));
        }
        // if all items from the current day were completed, add an empty item
        // for the next day
        if (next.length == 0) {
            next.push(new Item("", 0));
        }
        items.push(new ItemDay(nextDay, next));
        // flush the items to local storage and re-render
        storeToDoItems(items);
        rerender();
    }

    // TODO: ONLY USE FOR DEBUG
    function deleteAllItems() {
        // confirm first
        let goAhead = confirm(
            "WARNING: this will erase all stored items! Are you sure you " +
            "want to continue?");
        if (goAhead) {
            console.log("deleting all items");
            storeToDoItems([]);
            rerender();
        }
    }
</script>

<main class="vflex">
    <section id="header" class="hflex">
        <p id="title">To-Do</p>
        <div class="divider"></div>
        <IconButton
            src="/icons/edit.svg"
            alt="edit"
            size="20px"
            action={setEditMode}
            enabled={!$editMode}
        />
        <IconButton
            src="/icons/check.svg"
            alt="done"
            size="20px"
            action={unsetEditMode}
            enabled={$editMode}
        />
        <IconButton
            src="/icons/arrow-right.svg"
            alt="next day"
            size="20px"
            action={advanceDay}
        />
        <!-- TODO: ONLY USE FOR DEBUG -->
        <div class="divider"></div>
        <IconButton
            src="/icons/delete.svg"
            alt="delete all"
            size="20px"
            action={deleteAllItems}
        />
    </section>
    {#if $editMode}
        <ToDoEditArea/>
    {:else}
        <!-- use the key to re-render the list -->
        {#key key}
            <ToDoList/>
        {/key}
    {/if}
</main>

<style>
    main {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        align-items: center;
        padding: 32px 64px 64px 64px;
    }

    #title {
        font-size: 32px;
        font-weight: 600;
        margin: 20px 0;
    }

    #header {
        justify-content: flex-start;
        align-items: center;
        align-self: flex-start;
        gap: 16px;
    }

    .divider {
        width: 1px;
        height: 72%;
        background-color: #AAAAAA;
        margin: 0 16px;
    }
</style>
