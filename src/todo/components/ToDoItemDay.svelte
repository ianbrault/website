<!--
    ToDoItemDay.svelte
-->

<script>
    import ToDoItem from "./ToDoItem.svelte";
    import "../base.css";

    export let date;
    export let items;

    function getMonth(date) {
        return new Intl.DateTimeFormat("en-US", {month: "long"}).format(date);
    }

    function dateToString(date) {
        let day = String(date.getDate()).padStart(2, "0");
        let month = getMonth(date);
        let year = date.getFullYear();
        return `${day} ${month} ${year}`;
    }
</script>

<div>
    <p class="date">{dateToString(date)}</p>
    <div class="todo-item-day-items vflex">
        {#each items as item (item.id)}
            <ToDoItem {...item} on:toggled/>
        {/each}
    </div>
</div>

<style>
    .date {
        font-size: 20px;
        font-weight: 600;
        color: #222222;
        margin: 16px 0;
    }

    .todo-item-day-items {
        gap: 2px;
    }
</style>
