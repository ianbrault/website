<!--
    ToDoItem.svelte
-->

<script>
    import "../base.css";

    export let id;
    export let text;
    export let level;

    const IndentPerLevel = 32;
</script>

<div style={`padding-left: ${level * IndentPerLevel}px`}>
    <input id={id} type="checkbox">
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

