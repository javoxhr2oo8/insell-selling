<script setup>
import { ref } from 'vue';
import { useStore } from '~/store/store';
import { useUtil } from '~/server/util';
import { db } from '~/server/db';
import { ToastSuccess } from '@/composables/toast';
import DeleteAlertModal from './AlertModal/DeleteAlertModal.vue';
import { useKey } from '@/composables/useKey';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    minusPrice: {
        type: Number,
        default: 0
    },
    finalPayable: {
        type: Number,
        default: 0
    }
})

const emit = defineEmits(['update:modelValue'])

const store = useStore()
const { formatUZS, focusInput } = useUtil()

const isModalOpen = ref(false)

const openDeleteModal = () => {
    isModalOpen.value = true
}

const cancelDelete = () => {
    isModalOpen.value = false
}

async function deleteOrderFromList(orderIdToDelete) {
    if (!orderIdToDelete) return;

    try {
        const data = await db.createOrderOffline.get('createOrderOffline');
        if (!data || !data.list) return;

        const currentIndex = data.list.findIndex(o => String(o.id) === String(orderIdToDelete));

        let nextOrder = null;
        if (data.list.length > 1) {
            if (currentIndex < data.list.length - 1) {
                nextOrder = data.list[currentIndex + 1];
            }
            else {
                nextOrder = data.list[currentIndex - 1];
            }
        }

        const updatedList = data.list.filter(order => String(order.id) !== String(orderIdToDelete));
        await db.createOrderOffline.update('createOrderOffline', {
            list: updatedList,
            updatedAt: new Date().toISOString()
        });
        
        await db.offlineTrades.delete(orderIdToDelete).catch(() => { });

        if (String(store.orderId) === String(orderIdToDelete)) {
            if (nextOrder) {
                store.orderId = nextOrder.id;
                focusInput('trades-input')
                store.ordinalNumber = nextOrder.ordinal_number;
            } else {
                emit('update:modelValue', false);
                store.orderId = null;
                store.ordinalNumber = null;
            }
        }

        isModalOpen.value = false;

        store.updateOrders = true;
        setTimeout(() => { store.updateOrders = false }, 100);

    } catch (error) {
        console.error("Xatolik:", error);
    }
}

useKey((eventData) => {
    if (!isModalOpen.value) return

    if (eventData.key === 'Enter') {
        eventData.prevent()
        deleteOrderFromList(store.orderId)
        isModalOpen.value = false
    }

    if (eventData.key === 'Escape') {
        eventData.prevent()
        isModalOpen.value = false
    }
})
</script>

<template>
    <Delete-alert-modal v-model:isOpen="isModalOpen">
        <template #body>
            <div class="delete-content">
                <span>{{ store.ordinalNumber }} - Buyurtma</span>
                <p class="final-warning">Rostdan ham o'chirilsinmi?</p>
            </div>
        </template>

        <template #footer>
            <div class="custom-footer">
                <button class="btn-custom-cancel" @click="cancelDelete">
                    Yo’q, ortga qaytish
                </button>
                <button class="btn-custom-delete" @click="deleteOrderFromList(store.orderId)">
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
                <h2 v-if="minusPrice > 0" class="minus-price"> {{ formatUZS(finalPayable ? finalPayable : store.totalPriceOffline) }} so'm</h2>
                <h2>{{ formatUZS(finalPayable - minusPrice) }} so'm</h2>
            </div>
            <button @click="openDeleteModal"><i class="fa-solid fa-xmark"></i></button>
        </header>

        <slot />

        <footer>
            <slot name="footer-actions" />
        </footer>
    </div>
</template>

<style scoped lang="scss">
.minus-price {
    font-size: 19px !important;
    color: var(--dark-color) !important;
    opacity: 0.8;
    text-decoration: line-through;
}
</style>