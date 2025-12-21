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
        <Transition name="fall">
            <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">

                <div class="modal-content">
                    <div class="modal-body">
                        <slot />
                    </div>
                </div>

            </div>
        </Transition>
    </Teleport>
</template>

<style scoped></style>