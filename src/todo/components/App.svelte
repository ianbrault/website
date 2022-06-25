<!--
    App.svelte
    main application component
-->

<script>
    import "../base.css";
    import ToDoList from "./ToDoList.svelte";
</script>

<main class="vflex">
    <p id="title">To-Do</p>
    <ToDoList/>
</main>

<style>
    main {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        align-items: center;
        padding: 32px 64px;
    }

    #title {
        font-size: 32px;
        font-weight: 600;
        align-self: flex-start;
        margin: 20px 0;
    }
</style>

