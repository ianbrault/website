<!--
    IconButton.svelte
-->

<script>
    export let src;
    export let alt;
    export let size;
    export let action;
    export let enabled = true;

    function divStyle() {
        return `width: ${size}; height: ${size};`;
    }

    function onClick(event) {
        if (enabled && action) {
            action(event);
        }
    }
</script>

<div
    style={divStyle()}
    class:button--enabled="{enabled}"
    class:button--disabled="{!enabled}"
    alt={alt}
    on:click={onClick}
    on:keypress={() => {}}
    role="button" tabindex="0"
>
    <img src={src} alt={alt}/>
</div>

<style>
    div {
        border: 1px solid black;
        border-radius: 8px;
        padding: 8px;
    }

    .button--enabled {
        cursor: pointer;
    }

    .button--disabled {
        opacity: 0.5;
    }

    img {
        width: 100%;
        height: 100%;
    }
</style>

