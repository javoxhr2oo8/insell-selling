<script setup>
import api from '~/server/api';
import { ToastError, ToastSuccess } from '@/composables/toast';
import { useStore } from '~/store/store';
import { useUtil } from '~/server/util';
import { db } from '~/server/db';

const customerName = ref("")
const customerNumber = ref(0)

const beforeBtn = ref(true)
const loadingBtn = ref(false)

const { findError } = useUtil()

const store = useStore()

const query = reactive({
    branch_id: store.userInfo.branch_id,
    page: 0,
    status: false,
})

const orders = ref({})
const isFirstRun = ref(true)


const getOrdersOffline = async () => {
    const getData = await db.orders.get('orders')
    if (getData.list) {
        orders.value = getData.list
        store.ordinalNumber = getData.list[0].Orders?.ordinal_number
    }
}

const getOrders = async () => {
    store.loader = true
    const res = await api.get_orders(query).catch(err => {
        findError('signIn', err.response?.status)
    })

    // orders.value = res?.data
    store.loader = false

    if (res?.data) {
        db.orders.put({
            id: 'orders',
            list: res?.data,
            updatedAt: new Date().toISOString()
        })
    }

    if (res?.data?.length > 0) {
        if (isFirstRun.value) {
            store.orderId = res.data[0]?.Orders?.id
            store.branchId = res.data[0]?.Orders?.branch_id
            isFirstRun.value = false
        }
        else if (!store.orderId) {
            store.orderId = res.data[0]?.Orders?.id
        }
    }

    getOrdersOffline()
}

const orderInfo = (item) => {
    isFirstRun.value = false
    store.orderId = item?.Orders?.id
    store.branchId = item?.Orders?.branch_id
}

const createOrder = async () => {
    // store.loader = true
    // beforeBtn.value = false
    // loadingBtn.value = true

    // const res = await api.create_order(customerName.value, customerNumber.value).catch(err => {
    //     findError('signIn', err.response?.status)
    // })

    const existingData = await db.createOrderOffline.get('createOrderOffline');

    const currentList = existingData?.list || [];

    const newOrder = {
        id: Date.now(),
        data: {
            customer_name: customerName.value,
            customer_phone: customerNumber.value
        },
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    const updatedList = [...currentList, newOrder];

    console.log('Заказ сохранен офлайн. Всего заказов:', updatedList.length);

    // if (res) {
    //     ToastSuccess('Order qo\'shildi')
    //     customerName.value = ""
    //     customerNumber.value = 0

    //     await getOrders()
    // } else {
    //     ToastError('Xatolik юз берди')
    // }

    // store.loader = false
    // beforeBtn.value = true
    // loadingBtn.value = false
}

const offlineOrders = ref({})

const getCreatedOrders = async ()=> {
    const dataCreatedOff = await db.createOrderOffline.get('createOrderOffline');
    if(dataCreatedOff) {
        offlineOrders.value = dataCreatedOff.list
    }
}

const createOrderOffline = async () => {
    const existingData = await db.createOrderOffline.get('createOrderOffline');

    const currentList = existingData?.list || [];

    const newOrder = {
        customer_name: customerName.value,
        customer_phone: customerNumber.value,
        createdAt: new Date().toISOString()
    };

    const updatedList = [...currentList, newOrder];

    await db.createOrderOffline.put({
        id: 'createOrderOffline',
        list: updatedList,
        updatedAt: new Date().toISOString()
    });

    console.log('Заказ реально сохранен в БД. Всего в очереди:', updatedList.length);

    getCreatedOrders()
};

onMounted(() => {
    getOrders()
    getOrdersOffline()
    getCreatedOrders()
})

watch(() => store.ordersLoading, () => {
    getOrders()
})
</script>

<template>
    <div>
        <div class="add-order">
            <div class="container">
                <div class="add-order-wrapper">
                    <button @click="createOrderOffline()" class="add-order-btn" v-if="beforeBtn">
                        <i class="fa fa-plus"></i>
                    </button>
                    <button class="add-order-btn" v-if="loadingBtn">
                        <SpinerLoader />
                    </button>

                    <div class="add-order-orders">
                        <button v-for="item in orders" :key="item.Orders?.id || item.id" @click="orderInfo(item), store.ordinalNumber = item.Orders?.ordinal_number"
                            :class="{ 'active-order': store.orderId === item.Orders?.id }">
                            {{ item.Orders?.ordinal_number }} <span>{{ store.orderId === item.Orders?.id ? ' - ' : '' }}</span> <span>{{ store.orderId === item.Orders?.id ? 'Buyurtma' : ''}}</span>
                        </button>
                        <button v-for="(item, i) in offlineOrders">{{ i + 1 }}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>