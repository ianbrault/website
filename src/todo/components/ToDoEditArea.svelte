<!--
    ToDoEditArea.svelte
-->

<script>
    import { Item } from "../Item.js";
    import { editMode, toDoItems } from "../stores.js";
    import { dump, parse } from "../todoTextParser.js";

    let textarea;

    const ItemLeader = "[ ]";
    const Tab = "    ";

    function setCursor(pos) {
        textarea.selectionStart = pos;
        textarea.selectionEnd = pos;
    }

    function currentLineStart() {
        let i = textarea.selectionStart;
        while (i >= 0 && textarea.value[i] !== "\n") {
            i--;
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

    function addNewItem() {
        let cursorPos = textarea.selectionStart;
        let indentLevel = currentLineIndentLevel();
        let newItem = "\n" + " ".repeat(indentLevel) + ItemLeader + " ";
        textarea.value = textarea.value.slice(0, cursorPos)
            + newItem
            + textarea.value.slice(cursorPos);
        setCursor(cursorPos + newItem.length);
    }

    function deleteCurrentItem() {
        let cursorPos = textarea.selectionStart;
        let lineStart = currentLineStart();
        let sliceStart = lineStart == 0 ? 0 : lineStart - 1;
        textarea.value = textarea.value.slice(0, sliceStart)
            + textarea.value.slice(cursorPos);
        setCursor(sliceStart);
    }

    function indentCurrentItem() {
        let lineStart = currentLineStart();
        textarea.value = textarea.value.slice(0, lineStart)
            + Tab
            + textarea.value.slice(lineStart);
    }

    function unindentCurrentItem() {
        let indentLevel = currentLineIndentLevel();
        if (indentLevel > 0) {
            let lineStart = currentLineStart();
            textarea.value = textarea.value.slice(0, lineStart)
                + textarea.value.slice(lineStart + Tab.length);
        }
    }

    function onTextInput(event) {
        let cursorPos = textarea.selectionStart;

        // add a new item if enter was pressed
        if (event.key === "Enter") {
            addNewItem();
            event.preventDefault();
        }
        // delete the current item if backspace was pressed and the cursor is
        // at the start of the line
        if (event.key === "Backspace") {
            if (cursorPos == currentLineContentsStart()) {
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

    function onFocus() {
        // add the initial item if the edit area is empty
        if (textarea.value.length == 0) {
            textarea.value = ItemLeader + " ";
            setCursor(textarea.value.length);
        }
    }

    editMode.subscribe((mode) => {
        if (textarea) {
            // dump the to-do items into text when entering edit mode
            if (mode) {
                textarea.value = dump($toDoItems);
            }
            // and parse and store the to-do items when leaving edit mode
            else {
                let itemObjects = parse(textarea.value);
                let items = itemObjects.map(obj => Item.fromJSON(obj));
                toDoItems.set(items);
            }
        }
    });
</script>

<textarea
    id="todo-edit"
    bind:this={textarea}
    on:focus={onFocus}
    on:keydown={onTextInput}
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
