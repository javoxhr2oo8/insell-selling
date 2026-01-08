<script setup>
const { title } = defineProps(['title'])
</script>

<template>
    <div class="double-input">
        <div class="double-input-wrapper">
            <h2>{{ title }}</h2>
            <div class="double-inputs">
                <slot />
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.double-input {
    margin-top: 20px;
}

.double-input-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    h2 {
        font-weight: 600;
        font-size: 30px;
        color: var(--pr-color);
    }
}

.double-inputs {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;

    input {
        width: 100%;
        background: transparent;
        border: 1px solid #c9c9c9;
        padding: 15px;
        outline: none;
        color: var(--dark-color);
        font-size: 20px;
        border-radius: 10px;
    }
}
</style>