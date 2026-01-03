<script setup>
import { useStore } from '~/store/store';
import { useUtil } from '~/server/util';
import api from '~/server/api';
import DeleteAlertModal from './AlertModal/DeleteAlertModal.vue';

defineProps({
    modelValue: Boolean
})

defineEmits(['update:modelValue'])

const store = useStore()

const { formatUZS, findError } = useUtil()

const isModalOpen = ref(false)

const openDeleteModal = () => {
    isModalOpen.value = true
}

const cancelDelete = () => {
    isModalOpen.value = false
}

const deleteOrder = async () => {
    store.ordersLoading = true;
    store.loader = true;
    try {
        await api.remove_order(store.orderId);
    } catch (err) {
        findError('signIn', err.response?.status)
    } finally {
        store.ordersLoading = false;
        store.loader = false;
        cancelDelete()
    }
}
</script>

<template>
    <Delete-alert-modal v-model:isOpen="isModalOpen" @confirm="handleDeleteConfirm">

        <template #body>
            <div class="delete-content">
                <span>{{ store.ordinalNumber }} - Buyurtma</span>
                <p class="final-warning">
                    Rostdan ham o'chirilsinmi?
                </p>
            </div>
        </template>

        <template #footer>
            <div class="custom-footer">
                <button class="btn-custom-cancel" @click="cancelDelete">
                    Yo’q, ortga qaytish
                </button>
                <button class="btn-custom-delete" @click="deleteOrder()">
                    Ha, o’chirilsin
                </button>
            </div>
        </template>

    </Delete-alert-modal>

    <div class="section-index" v-if="modelValue">
        <header>
            <slot name="back-btn" />
            <div class="section-header-all-price">
                <span>{{ store.ordinalNumber }} - Buyurtma</span>
                <h2>{{ formatUZS(store.ordersBlance?.[0]?.balance) }} so'm</h2>
            </div>
            <button @click="openDeleteModal"><i class="fa-solid fa-xmark"></i></button>
        </header>

        <slot />

        <footer>
            <slot name="footer-actions"/>
        </footer>
    </div>
</template>