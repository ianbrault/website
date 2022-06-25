<!--
    ToDoItem.svelte
-->

<script>
    import { createEventDispatcher } from "svelte";

    import "../base.css";
    import { focusedItem } from "../stores.js";

    const dispatch = createEventDispatcher();
    const IndentPerLevel = 32;

    // props
    export let id;
    export let parentId;
    export let text;
    export let level;

    let label;
    let checked = false;
    let editable = false;
    let shiftPressed = false;

    function focus(event) {
        editable = true;
        // NOTE: setTimeout is necessary in order for the focus event to fire
        setTimeout(function() {
            label.focus();
        }, 0);
        // FIXME: DEBUG
        event.preventDefault();
    }

    function eventInfo() {
        // packages up the to-do item info into an Object
        return {
            id: id,
            parentId: parentId,
            text: label.textContent,
            level: level,
        };
    }

    function unfocus(_event) {
        editable = false;
        dispatch("update", eventInfo());
    }

    function onKeyDown(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            unfocus();
            dispatch("enter", eventInfo());
        }
        else if (event.key === "Tab") {
            event.preventDefault();
            if (shiftPressed) {
                dispatch("shifttab", eventInfo());
            } else  {
                dispatch("tab", eventInfo());
            }
        }
        else if (event.key === "Escape") {
            event.preventDefault();
            unfocus();
            dispatch("escape", eventInfo());
        }
        else if (event.key === "Shift") {
            // track when Shift is pressed/released
            shiftPressed = true;
        }
    }

    function onKeyUp(event) {
        if (event.key === "Shift") {
            // track when Shift is pressed/released
            shiftPressed = false;
        }
    }

    // subscribe to the focused item store and focus the current item whenever
    // it is requested by another component
    focusedItem.subscribe(focusedId => {
        if (focusedId == id) {
            focus();
        }
    });
</script>

<div style={`padding-left: ${level * IndentPerLevel}px`}>
    <input
        id={id}
        type="checkbox"
        bind:checked={checked}
    >
    <label
        for={id}
        bind:this={label}
        on:click={focus}
        on:focusout={unfocus}
        on:keydown={onKeyDown}
        on:keyup={onKeyUp}
        contenteditable={editable}
    >
        {text}
    </label>
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

