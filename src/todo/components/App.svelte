<!--
    App.svelte
    main application component
-->

<script>
    import { editMode, toDoItems } from "../stores.js";
    import { storeToDoItems } from "../storage_driver.js";

    import IconButton from "./IconButton.svelte";
    import ToDoList from "./ToDoList.svelte";
    import "../base.css";

    function setEditMode() {
        editMode.set(true);
    }

    function unsetEditMode() {
        editMode.set(false);
    }

    // store the to-do items to local storage whenever they change
    // done at the top-level component for simplicity/clarity
    toDoItems.subscribe((items) => {
        storeToDoItems(items);
    });
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
    </section>
    <ToDoList/>
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

