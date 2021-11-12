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
    <p><em>{text}</em></p>
</div>

<style>
    p {
        color: #5a5a5a;
        font-size: 12px;
        font-weight: 300;
        margin: 4px 0;
    }
</style>
