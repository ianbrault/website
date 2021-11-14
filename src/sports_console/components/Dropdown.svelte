<!--
    Dropdown.svelte
    dropdown menu
-->

<script>
    export let text;
    export let onClick;

    let shown = false;
    let menu_items = [
        "edit",
        "delete",
    ];

    function toggle() {
        shown = !shown;
    }
</script>

<div class="dropdown-wrapper">
    <p class="dropdown-button" on:click={toggle}>
        {text}
    </p>
    <div class="bordered-round" class:dropdown-menu-shown={shown} class:dropdown-menu-hidden={!shown} on:mouseleave={toggle}>
        {#each menu_items as item}
            <p class="dropdown-item" on:click={() => onClick(item)}>{item}</p>
        {/each}
    </div>
</div>

<style>
    .dropdown-wrapper {
        align-self: center;
        position: relative;
        display: inline-block;
    }

    .dropdown-button {
        cursor: pointer;
        margin: 0;
        font-size: 12px;
        font-weight: bold;
        user-select: none;
    }

    .dropdown-menu-hidden, .dropdown-menu-shown {
        position: absolute;
        right: 0;
        min-width: 100px;
        background-color: white;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;
    } .dropdown-menu-hidden {
        display: none;
    } .dropdown-menu-shown {
        display: block;
    }

    .dropdown-item {
        margin: 0;
        padding: 4px 8px;
        text-align: left;
        font-size: 13px;
        border-radius: 4px;
    } .dropdown-item:hover {
        background-color: #eeeeee;
    }
</style>
