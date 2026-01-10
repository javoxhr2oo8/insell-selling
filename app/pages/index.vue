<script setup>
import api from '~/server/api';
import { useStore } from '~/store/store';
import { db } from '@/server/db'

const store = useStore()

const data = reactive({
    branch_id: store.branchId,
    role: 'seller',
    page: 0,
    limit: 1000
})

const getUsers = async () => {
    const res = await api.get_users(data)
    store.sellerId = res?.data[0]?.id
    store.customerName = res?.data[0]?.name
    store.customerPhone = res?.data[0]?.phone
}

const getConfirmOrders = ref([])

const ConfirmationOrder = async () => {
    const data = await db.orders_confirm.get('orders_confirm')
    getConfirmOrders.value = data?.list || []
}

const TradesById = async (orderId) => {
    const data = await db.offlineTrades.get(orderId)
    return data?.trades || []
}

const createOrderPayload = async (order) => {
    const trades = await TradesById(order.order_id)

    if (!trades.length) return null

    return {
        create_order: {
            id: 1,
            customer_name: order.customer_name || '',
            customer_phone: Number(order.customer_phone) || 0
        },

        create_trades: trades.map(el => ({
            order_id: 1,
            code: el.Products.code,
            quantity: Number(el.quantity) || 1,
            price: el.Products.price || 0,
            discount: el.Products.discount || 0
        })),

        order_confirmation: {
            order_id: 1,
            customer_name: order.customer_name || '',
            customer_phone: Number(order.customer_phone) || 0,
            discount: order.discount || 0,
            money: order.money || [],
            loan_repayment_date: order.loan_repayment_date || "2026-01-09",
            loan_comment: order.loan_comment || '',
            seller_id: order.seller_id,
            service_id: order.service_id || 0,
            service_price: order.service_price || 0
        }
    }
}

const sendToApi = async () => {
    await ConfirmationOrder()
    if (!getConfirmOrders.value.length) {
        console.log('⚠️ Нечего отправлять')
        return
    }

    if (!navigator.onLine) {
        console.log('❌ Нет интернета — остаётся в Dexie')
        return
    }

    for (const order of getConfirmOrders.value) {
        console.log(order);
        
        if (!order.status) {
            try {
                const payload = await createOrderPayload(order)

                if (!payload) {
                    console.log(`⚠️ Order ${order.order_id} имеет пустые trades, пропускаем`)
                    continue
                }

                // Отправляем 1 заказ
                const response = await api.order_confirmation_for_offline([payload])

                // Проверяем статус
                if (response.detail === 'Savdo muvaffaqiyatli amalga oshirildi') {
                    console.log(`✅ Order ${order.order_id} успешно отправлен`)

                    // Удаляем из orders_confirm по order_id
                    const confirmData = await db.orders_confirm.get('orders_confirm')
                    if (confirmData?.list) {
                        confirmData.list = confirmData.list.filter(o => o.order_id !== order.order_id)
                        await db.orders_confirm.put(confirmData, 'orders_confirm')
                    }

                    // Также удаляем trades для этого order
                    await db.offlineTrades.delete(order.order_id)
                }

            } catch (error) {
                console.error(error.status)

                // Если статус 400 или другая ошибка, добавляем status: 'error'
                if (error.status === 400) {
                    const confirmData = await db.orders_confirm.get('orders_confirm')
                    if (confirmData?.list) {
                        // Находим заказ и обновляем его статус
                        const orderIndex = confirmData.list.findIndex(o => o.order_id === order.order_id)

                        if (orderIndex !== -1) {
                            confirmData.list[orderIndex] = {
                                ...confirmData.list[orderIndex],
                                status: 'error',
                                error_message: error.message || 'Unknown error',
                                error_timestamp: new Date().toISOString()
                            }

                            await db.orders_confirm.put(confirmData, 'orders_confirm')
                            console.log(`💾 Order ${order.order_id} статус обновлён на 'error'`)
                        }
                    }
                }
            }

        }

    }

    // Обновляем список после обработки
    await ConfirmationOrder()
}

const syncWhenOnline = async () => {
    await ConfirmationOrder()
    await sendToApi()
}

onMounted(async () => {
    await getUsers()
    await ConfirmationOrder()

    if (navigator.onLine) {
        await sendToApi()
    }

    window.addEventListener('online', syncWhenOnline)
})
</script>

<template>
    <div>
        <Header />
        <AddOrder />
        <div class="orders-and-total-price-wrapper">
            <Orders class="orders-component" />
            <RightSections @orderAccept="syncWhenOnline" />
        </div>
        <!-- <confirm /> -->
    </div>
</template>

<style>
.orders-and-total-price-wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
    background: var(--body-color);
}

.orders-component {
    width: 100%;
}
</style>