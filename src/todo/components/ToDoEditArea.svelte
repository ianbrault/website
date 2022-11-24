<!--
    ToDoEditArea.svelte
-->

<script>
    import { onDestroy, onMount } from "svelte";

    import { ItemDay } from "../ItemDay.js";
    import { loadToDoItems, storeToDoItems } from "../storage_driver.js";
    import { dump, parse } from "../todo_text_parser.js";

    let textarea;

    const ItemLeader = "[ ]";
    const Tab = "    ";

    function setCursor(pos) {
        textarea.selectionStart = pos;
        textarea.selectionEnd = pos;
    }

    function currentLineStart() {
        let i = textarea.selectionStart;
        // use the "previous" line if the cursor is at the end of a line
        if (textarea.value[i] == "\n") {
            i--;
        }
        while (i >= 0 && textarea.value[i] !== "\n") {
            i--;
        }
        return i + 1;
    }

    function nextLineStart() {
        let i = textarea.selectionStart;
        while (i < textarea.value.length && textarea.value[i] !== "\n") {
            i++;
        }
        return i + 1;
    }

    function currentLineIndentLevel() {
        let start = currentLineStart();
        let i = start;
        while (textarea.value[i] === " ") {
            i++;
        }
        return i - start;
    }

    function currentLineContentsStart() {
        return currentLineStart()
            + currentLineIndentLevel()
            + ItemLeader.length + 1;
    }

    function currentLineContents() {
        return textarea.value.slice(
            currentLineContentsStart(), nextLineStart());
    }

    function currentLineFullContents() {
        return textarea.value.slice(currentLineStart(), nextLineStart());
    }

    function addNewItem() {
        let cursorPos = textarea.selectionStart;
        let indentLevel = currentLineIndentLevel();
        let newItem = "\n" + " ".repeat(indentLevel) + ItemLeader + " ";
        textarea.value = textarea.value.slice(0, cursorPos)
            + newItem
            + textarea.value.slice(cursorPos);
        setCursor(cursorPos + newItem.length);
    }

    function deleteCurrentItem(cursorPos = undefined) {
        if (cursorPos === undefined) {
            cursorPos = textarea.selectionStart;
        }
        let lineStart = currentLineStart();
        let sliceStart = lineStart == 0 ? 0 : lineStart - 1;
        textarea.value = textarea.value.slice(0, sliceStart)
            + textarea.value.slice(cursorPos);
        setCursor(sliceStart);
    }

    function indentCurrentItem() {
        let cursorPos = textarea.selectionStart;
        let lineStart = currentLineStart();
        textarea.value = textarea.value.slice(0, lineStart)
            + Tab
            + textarea.value.slice(lineStart);
        setCursor(cursorPos + Tab.length);
    }

    function unindentCurrentItem() {
        let cursorPos = textarea.selectionStart;
        let indentLevel = currentLineIndentLevel();
        if (indentLevel > 0) {
            let lineStart = currentLineStart();
            textarea.value = textarea.value.slice(0, lineStart)
                + textarea.value.slice(lineStart + Tab.length);
            setCursor(cursorPos - Tab.length);
        }
    }

    function currentLineIsDateLine() {
        return currentLineFullContents().startsWith("DATE: ");
    }

    function onTextInput(event) {
        let cursorPos = textarea.selectionStart;

        // add a new item if enter was pressed
        // OR if the current item is empty and indented, un-indent it
        if (event.key === "Enter") {
            if (!currentLineContents() && currentLineIndentLevel() > 0) {
                unindentCurrentItem();
            } else {
                addNewItem();
            }
            event.preventDefault();
        }
        // delete the current item if backspace was pressed and the cursor is
        // at the start of the line or if it is a date line
        if (event.key === "Backspace") {
            // check if the cursor is anywhere within the indicator
            let lineStart = currentLineStart();
            let contentsStart = currentLineContentsStart();
            if (cursorPos >= lineStart && cursorPos <= contentsStart) {
                deleteCurrentItem(contentsStart);
                event.preventDefault();
            } else if (currentLineIsDateLine()) {
                deleteCurrentItem();
                event.preventDefault();
            }
        }
        // indent the current item if tab is pressed
        if (event.key === "Tab" && !event.shiftKey) {
            indentCurrentItem();
            event.preventDefault();
        }
        // un-indent the current item if shift+tab is pressed
        if (event.key === "Tab" && event.shiftKey) {
            unindentCurrentItem();
            event.preventDefault();
        }
    }

    function onClick() {
        let cursorPos = textarea.selectionStart;
        // if the click is on a date line, move the cursor to the end
        if (currentLineIsDateLine()) {
            setCursor(nextLineStart() - 1);
        }
        // if the click is before the line contents, move the cursor to the
        // start of the contents
        else if (
            cursorPos >= currentLineStart()
            && cursorPos < currentLineContentsStart()
        ) {
            setCursor(currentLineContentsStart());
        }
    }

    function getCurrentDate() {
        let date = new Date();
        // zero out hour/minutes/seconds
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date.toUTCString();
    }

    function onFocus() {
        // add the initial date + item if the edit area is empty
        if (textarea.value.length == 0) {
            textarea.value = `DATE: ${getCurrentDate()}\n${ItemLeader} `;
            setCursor(textarea.value.length);
        }
    }

    // load and dump the stored to-do items when the component mounts
    onMount(() => {
        let items = loadToDoItems();
        textarea.value = dump(items);
    });
    // parse and store the to-do items when the component unmounts

    onDestroy(() => {
        let itemObjects = parse(textarea.value);
        let items = itemObjects.map(obj => ItemDay.fromJSON(obj));
        storeToDoItems(items);
    });
</script>

<textarea
    id="todo-edit"
    bind:this={textarea}
    on:focus={onFocus}
    on:keydown={onTextInput}
    on:mouseup={onClick}
>
</textarea>

<style>
    #todo-edit {
        width: 100%;
        height: 100%;
        resize: none;
        font-family: "Source Code Pro", monospace;
    }
</style>
