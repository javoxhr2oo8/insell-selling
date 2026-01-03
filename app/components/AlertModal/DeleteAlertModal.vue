<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3 class="modal-title">
                            <slot name="title">Tastiqlash</slot>
                        </h3>
                        <button class="modal-close" @click="closeModal">×</button>
                    </div>

                    <div class="modal-body">
                        <slot name="body">
                            <p>Вы уверены, что хотите удалить заказ?</p>
                        </slot>
                    </div>

                    <div class="modal-footer">
                        <slot name="footer">
                            <button class="btn btn-cancel" @click="closeModal">
                                Отменить
                            </button>
                            <button class="btn btn-confirm" @click="$emit('confirm')">
                                Подтвердить
                            </button>
                        </slot>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
defineProps({
    isOpen: {
        type: Boolean,
        required: true
    }
})

const emit = defineEmits(['update:isOpen', 'confirm'])

const closeModal = () => {
    emit('update:isOpen', false)
}
</script>

<style scoped lang="scss">
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
}

.modal-container {
    background: white;
    border-radius: 12px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
    background: var(--pr-color);
    color: #fff;
}

.modal-title {
    margin: 0;
    font-size: 30px;
    font-weight: 600;
}

.modal-close {
    background: none;
    border: none;
    font-size: 44px;
    cursor: pointer;
    color: #fff;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: background-color 0.2s;
    &:hover {
        opacity: 0.7;
    }
}

.modal-body {
    padding: 24px;
    color: #374151;
    line-height: 1.5;
    font-size: 25px;
}

.modal-footer {
    padding: 20px 24px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    font-size: 14px;
}

.btn-cancel {
    background-color: #f3f4f6;
    color: #374151;
}

.btn-cancel:hover {
    background-color: #e5e7eb;
}

.btn-confirm {
    background-color: #dc2626;
    color: white;
}

.btn-confirm:hover {
    background-color: #b91c1c;
}

.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
    transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
    transform: scale(0.95);
}
</style>