<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useStore } from '~/store/store'
import { useUtil } from './server/util'
import { db } from './server/db'
import api from './server/api'

const store = useStore()
const { routerState } = useUtil()

const tokenCookie = useCookie('access_token')

if (tokenCookie.value) {
  store.token = tokenCookie.value
}

if (process.client) {
  const savedData = localStorage.getItem('info')
  if (savedData) {
    try {
      const tokenInfo = JSON.parse(savedData)
      store.userInfo = tokenInfo
      if (!store.token) store.token = tokenInfo.access_token
    } catch (e) {
      console.error('Failed to parse auth data', e)
    }
  }

  if (!tokenCookie.value) {
    routerState('signIn')
  }
}

const getOrders = ref([])
const getConfirmOrders = ref([])

const ConfirmationOrder = async () => {
  const data = await db.orders_confirm.get('orders_confirm')
  getConfirmOrders.value = data?.list || []
}

const Orders = async () => {
  const data = await db.createOrderOffline.get('createOrderOffline')
  getOrders.value = data?.list || []
}

const TradesById = async (orderId) => {
  const data = await db.offlineTrades.get(orderId)
  return data?.trades || []
}

const allConfirmatedOrders = async () => {
  const result = []

  for (const order of getOrders.value) {
    const confirmation = getConfirmOrders.value.find(
      c => String(c.order_id) === String(order.id)
    )

    if (!confirmation) continue

    const trades = await TradesById(order.id)
    if (!trades.length) continue


    result.push({
      create_order: {
        id: 1,
        customer_name: confirmation.customer_name || '',
        customer_phone: Number(confirmation.customer_phone) || 0
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
        customer_name: confirmation.customer_name || '',
        customer_phone: Number(confirmation.customer_phone) || 0,
        discount: confirmation.discount || 0,
        money: confirmation.money || [],
        loan_repayment_date: confirmation.loan_repayment_date || "2026-01-09",
        loan_comment: confirmation.loan_comment || '',
        seller_id: confirmation.seller_id,
        service_id: confirmation.service_id || 0,
        service_price: confirmation.service_price || 0
      }
    })
  }

  console.log('📦 Payload:', result)
  return result
}

const sendToApi = async () => {
  const payload = await allConfirmatedOrders()

  if (!payload.length) {
    console.log('⚠️ Нечего отправлять')
    return
  }

  if (!navigator.onLine) {
    console.log('❌ Нет интернета — остаётся в Dexie')
    return
  }

  try {
    await api.order_confirmation_for_offline(payload)
    console.log('✅ Успешно отправлено в API')
  } catch (e) {
    console.error('❌ Ошибка API, данные сохранены локально', e)
  }
}

const syncWhenOnline = async () => {
  console.log('🌐 Интернет появился — синхронизация')
  await ConfirmationOrder()
  await Orders()
  await sendToApi()
}

onMounted(async () => {
  await ConfirmationOrder()
  await Orders()

  if (navigator.onLine) {
    await sendToApi()
  }

  window.addEventListener('online', syncWhenOnline)
})

onUnmounted(() => {
  window.removeEventListener('online', syncWhenOnline)
})
</script>

<template>
  <div>
    <NuxtLayout />
    <!-- <button @click="sendToApi()">confirm offline</button> -->
    <!-- <loader v-if="store.loader" /> -->
  </div>
</template>