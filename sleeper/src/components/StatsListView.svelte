<!--
    StatsListView.svelte
    displays a ranked list of statistics
-->

<script>
    import "../base.css";

    export let title;
    export let headers;
    export let entries;

    function grid_layout_style() {
        let cols = `grid-template-columns: repeat(${headers.length + 1}, auto)`;
        let rows = `grid-template-rows: repeat(${entries.length + 1}, auto)`;
        return `${cols}; ${rows}`;
    }
</script>

<div class="stats-list-wrapper vflex">
    <p class="stats-list-title">{title}</p>
    <div class="stats-list-grid" style={grid_layout_style()}>
        <p class="grid-header">#</p>
        {#each headers as header}
            <p class="grid-header">{header}</p>
        {/each}
        {#each entries as entry, i}
            <p class="grid-item-index">{i + 1}</p>
            {#each entry as field, j}
                {#if j == 0}
                    <p class="grid-item-name">{field}</p>
                {:else}
                    <p class="grid-item">{field}</p>
                {/if}
            {/each}
        {/each}
    </div>
</div>

<style>
    .stats-list-wrapper {
        font-size: 14px;
        margin: 20px 0;
    }

    .stats-list-title {
        font-weight: 600;
        margin: 4px 0;
    }

    .stats-list-grid {
        display: grid;
        column-gap: 16px;
        row-gap: 2px;
    }

    .grid-header {
        font-weight: 600;
        margin: 4px 0;
        text-align: right;
    }

    .grid-header:nth-child(2) {
        text-align: left;
    }

    .grid-item-index {
        margin: 0;
        text-align: right;
    }

    .grid-item {
        margin: 0;
        text-align: right;
    }

    .grid-item-name {
        margin: 0;
        text-align: left;
    }

    @media only screen and (max-width: 768px) {
        .stats-list-wrapper {
            margin: 12px 0;
        }
    }
</style>

