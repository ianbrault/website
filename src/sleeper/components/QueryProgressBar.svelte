<!--
    QueryProgressBar.svelte
    displays a progress bar for the API queries
-->

<script>
    import { tweened } from "svelte/motion";

    import "../base.css";
    import { curr_query, num_queries } from "../stores.js";

    let value = tweened(0, {
        duration: 250,
    });
    let max = 0;

    curr_query.subscribe((n) => {
        value.set(n);
    });
    num_queries.subscribe((n) => {
        max = n;
    });
</script>

<progress max={max} value={$value}></progress>

<style>
    progress {
        width: 32vw;
    }
</style>

