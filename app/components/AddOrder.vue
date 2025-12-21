<script setup>
import api from '~/server/api';
import { ToastError, ToastSuccess } from '@/composables/toast';
import { useStore } from '~/store/store';
import { useUtil } from '~/server/util';

const customerName = ref("")
const customerNumber = ref(0)

const { findError } = useUtil()

const store = useStore()

const query = reactive({
    branch_id: store.userInfo.branch_id,
    page: 0,
    status: false,
})

const orders = ref({})

const orderInfo = (item) => {
    store.orderId = item?.Orders?.id
    store.branchId = item?.Orders?.branch_id
    console.log(item)
    console.log(store.orderId)
    console.log(store.branchId)
}

const getOrders = async () => {
    store.loader = true
    const res = await api.get_orders(query).catch(err => {
        findError('signIn', err.response?.status)
    })
    orders.value = res?.data
    store.loader = false
}

const createOrder = async () => {
    store.loader = true

    const res = await api.create_order(customerName.value, customerNumber.value).catch(err => {
        findError('signIn', err.response?.status)
    })

    if (res) {
        ToastSuccess('Order qo\'shildi')

        customerName.value = ""
        customerNumber.value = 0

        await getOrders()
    } else {
        ToastError('Xatolik юз берди')
    }

    store.loader = false
}

onMounted(() => {
    getOrders()
})

watch(()=> store.ordersLoading, ()=> {
    getOrders()
})
</script>

<template>
    <div>
        <div class="add-order">
            <div class="container">
                <div class="add-order-wrapper">
                    <button @click="createOrder()" class="add-order-btn"><i class="fa fa-plus"></i></button>

                    <div class="add-order-orders">
                        <button v-for="item in orders" :key="item.Orders?.id || item.id" @click="orderInfo(item)"
                            :class="{ 'active-order': store.orderId === item.Orders?.id }">
                            {{ item.Orders?.ordinal_number }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>