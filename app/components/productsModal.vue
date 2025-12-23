<script setup>
import { useStore } from '~/store/store';
defineProps({
    modelValue: Boolean
})

const store = useStore()

defineEmits(['update:modelValue'])
</script>

<template>
    <Teleport to="body">
        <Transition name="slide-right">
            <div v-if="modelValue" class="modal-m" @click.self="$emit('update:modelValue', false)">
                <div class="modal-content side-modal">
                    <div class="modal-body">
                        <slot />
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
    <div class="modal-overlay" v-if="modelValue"></div>
</template>

<style scoped>
.slide-right-enter-active,
.slide-right-leave-active {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
    opacity: 0;
    transform: translateX(100%);
}

.slide-right-enter-to,
.slide-right-leave-from {
    opacity: 1;
    transform: translateX(0);
}

.modal-overlay {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(5px);
    z-index: 1000;
}
</style>