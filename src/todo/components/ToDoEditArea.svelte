<!--
    ToDoEditArea.svelte
-->

<script>
    function onTextInput(event) {
        console.log(event);
    }
</script>

<textarea id="todo-edit" on:input={onTextInput}></textarea>

<style>
    #todo-edit {
        width: 100%;
        height: 100%;
        resize: none;
        font-family: "Source Code Pro", monospace;
    }
</style>
