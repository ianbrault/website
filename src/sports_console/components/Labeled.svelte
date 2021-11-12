<!--
    Labeled.svelte
    wraps and labels a child component
-->

<script>
    export let text;
</script>

<div>
    <!-- child component goes here -->
    <slot/>
    <p>{text}</p>
</div>

<style>
    p {
        margin: 4px 0;
    }
</style>
