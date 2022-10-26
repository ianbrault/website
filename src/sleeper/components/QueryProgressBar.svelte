<!--
    QueryProgressBar.svelte
    displays a progress bar for the API queries
-->

<script>
    import { tweened } from "svelte/motion";

    import "../base.css";
    import { currQuery, numQueries } from "../stores.js";

    let value = tweened(0, {
        duration: 250,
    });
    let max = 0;

    currQuery.subscribe((n) => {
        value.set(n);
    });
    numQueries.subscribe((n) => {
        max = n;
    });
</script>

<section class="vflex">
    <progress max={max} value={$value}></progress>
</section>

<style>
    section {
        justify-content: center;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        align-items: center;
        padding: 32px 64px 64px 64px;
        font-size: 14px;
    }

    progress {
        width: 32vw;
    }
</style>

