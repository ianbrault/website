<!--
    ToDoItem.svelte
-->

<script>
    import { createEventDispatcher } from "svelte";

    import "../base.css";

    export let id;
    export let text;
    export let level;
    export let isChecked;

    const IndentPerLevel = 32;
    const dispatch = createEventDispatcher();

    let input;

    function onChange() {
        dispatch("toggled", {
            id: id,
            checked: input.checked,
        });
    }
</script>

<div style={`padding-left: ${level * IndentPerLevel}px`}>
    <input
        bind:this={input}
        id={id}
        type="checkbox"
        checked={isChecked}
        on:change={onChange}
    >
    <label for={id}>{text}</label>
</div>

<style>
    label {
        font-size: 16px;
        font-weight: 300;
        /* add padding to make the label more clickable */
        padding-right: 64px;
    }

    label:focus {
        outline: none;
    }

    input {
        margin-right: 8px;
    }
</style>

