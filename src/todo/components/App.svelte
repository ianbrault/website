<!--
    App.svelte
    main application component
-->

<script>
    import { storeToDoItems } from "../storage_driver.js";
    import { editMode } from "../stores.js";

    import IconButton from "./IconButton.svelte";
    import ToDoEditArea from "./ToDoEditArea.svelte";
    import ToDoList from "./ToDoList.svelte";
    import "../base.css";

    function setEditMode() {
        editMode.set(true);
    }

    function unsetEditMode() {
        editMode.set(false);
    }

    // TODO: ONLY USE FOR DEBUG
    function deleteAllItems() {
        console.log("deleting all items");
        storeToDoItems([]);
        alert("deleted items: reload the page");
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
        <ToDoList/>
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
