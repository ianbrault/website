<!--
    ToDoItem.svelte
-->

<script>
    import { createEventDispatcher, onMount, onDestroy } from "svelte";

    import "../base.css";
    import { focusedItem } from "../stores.js";

    const dispatch = createEventDispatcher();
    const IndentPerLevel = 32;

    // props
    export let id;
    export let text;
    export let level;

    let label;
    let isMounted = false;
    let focusQueued = false;
    let focusEnd = undefined;
    let checked = false;
    let editable = false;
    let shiftPressed = false;

    function focus(event) {
        editable = true;
        // NOTE: setTimeout is necessary in order for the focus event to fire
        setTimeout(function() {
            if (focusEnd) {
                let selection = window.getSelection();
                let range = document.createRange();
                // NOTE: unsure why the 1 puts the cursor at the end
                range.setStart(label, 1);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                label.focus();
            }
        }, 10);
        // sometimes we pass an empty event
        if (Object.keys(event).length > 0) {
            event.preventDefault();
        }
    }

    function eventInfo() {
        // packages up the to-do item info into an Object
        return {
            id: id,
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
            // un-focus on Escape
            event.preventDefault();
            unfocus();
            dispatch("escape", eventInfo());
        }
        else if (event.key === "Backspace") {
            // only request a delete once the item is empty
            if (label.textContent.length == 0) {
                event.preventDefault();
                dispatch("delete", eventInfo());
            }
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

    // note when the component has mounted
    onMount(() => {
        isMounted = true;
        // check if a focus action is queued
        if (focusQueued) {
            focus({});
            focusQueued = false;
        }
    });
    onDestroy(() => {
        isMounted = false;
    });

    // subscribe to the focused item store and focus the current item whenever
    // it is requested by another component
    focusedItem.subscribe(info => {
        if (info && info.id == id) {
            focusEnd = info.focusEnd;
            // NOTE: cannot focus until the component has mounted, this causes
            // issues when a new item is created and immediately focused
            if (isMounted) {
                focus({});
            } else {
                focusQueued = true;
            }
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

