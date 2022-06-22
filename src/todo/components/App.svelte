<!--
    App.svelte
    main application component
-->

<script>
    import "../base.css";
    import ToDoList from "./ToDoList.svelte";
</script>

<main class="vflex">
    <ToDoList/>
</main>

<style>
    main {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
    }
</style>

