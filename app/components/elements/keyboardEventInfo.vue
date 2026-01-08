<script setup>

</script>

<template>
    <div class="keyboard-event-template">
        <slot/>
    </div>
</template>

<style lang="scss">
.keyboard-event-template {
    background: var(--product-table-color);
    padding: 10px;
    border-radius: 10px;
    color: var(--dark-color);
    animation: keyboard-event-info-anim 1s forwards;
    h3 {
        width: 100px;
    }
}

@keyframes keyboard-event-info-anim {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
</style>