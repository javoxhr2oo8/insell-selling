<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useStore } from '~/store/store'
import { ToastSuccess } from '@/composables/toast'
import { useUtil } from '~/server/util'
import { db } from '~/server/db'

const emit = defineEmits(['refreshOrders'])

const store = useStore()

const { focusInput } = useUtil()

const customerName = ref('')
const customerNumber = ref('')
const beforeBtn = ref(true)
const loadingBtn = ref(false)

const isFirstRun = ref(true)

const getCreatedOrders = async () => {
    const data = await db.createOrderOffline.get('createOrderOffline');
    const list = data?.list || [];
    store.offlineOrdersList = list;

    if (list.length === 0) {
        store.orderId = null;
        store.ordinalNumber = null;
        setTimeout(()=> {
            createOrderOffline()
        }, 200)
        return;
    }

    if (isFirstRun.value && list.length > 0) {
        store.orderId = list[0].id;
        store.ordinalNumber = list[0].ordinal_number;
        isFirstRun.value = false;
    }
}

watch(() => store.updateOrders, (newVal) => {
    if (newVal === true) {
        getCreatedOrders();
    }
})

const generateOfflineOrderId = () => `OFF-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

async function createOrderOffline () {
    const existing = await db.createOrderOffline.get('createOrderOffline')
    const list = existing?.list || []
    const maxOrdinal = list.length > 0
        ? Math.max(...list.map(order => order.ordinal_number))
        : 0;

    const newOrderId = generateOfflineOrderId()
    const newOrder = {
        id: newOrderId,
        ordinal_number: maxOrdinal + 1,
        customer_name: customerName.value,
        customer_phone: customerNumber.value,
        createdAt: new Date().toISOString(),
        isOffline: true
    }

    const updated = [...list, newOrder]

    await db.createOrderOffline.put({
        id: 'createOrderOffline',
        list: updated,
        updatedAt: new Date().toISOString()
    })

    await db.offlineTrades.put({
        id: newOrderId,
        trades: [],
        updatedAt: new Date().toISOString()
    })

    focusInput('trades-input')

    ToastSuccess("Buyurtma qo'shildi")
    store.orderId = newOrderId
    store.isOfflineOrder = true
    store.ordinalNumber = newOrder.ordinal_number

    getCreatedOrders()
}

const selectOfflineOrder = (item) => {
    store.orderId = item.id
    store.branchId = store.userInfo.branch_id
    store.ordinalNumber = item.ordinal_number
    store.isOfflineOrder = true
}

onMounted(() => {
    getCreatedOrders()
})
</script>

<template>
    <div class="add-order">
        <div class="container">
            <div class="add-order-wrapper">

                <div class="add-order-orders">
                    <button v-for="item in store.offlineOrdersList" :key="item.id" @click="selectOfflineOrder(item), focusInput('trades-input')"
                        :class="{ 'active-order': store.orderId === item.id }">
                        {{ item.ordinal_number }}
                        <span v-if="store.orderId === item.id"> - Buyurtma</span>
                    </button>
                </div>

                <button v-if="beforeBtn" class="add-order-btn" @click="createOrderOffline">
                    <i class="fa fa-plus"></i>
                </button>
            </div>
        </div>
    </div>
</template>