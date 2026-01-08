<script setup>
import { useStore } from '~/store/store'
import { db } from '~/server/db'
import { ref, onMounted, watch } from 'vue'

const store = useStore()

const getTrades = ref([])

const tradesGetOffline = async () => {
    if (!store.orderId) {
        getTrades.value = []
        store.totalPriceOffline = 0
        store.ordersBlance = 0
        return
    }

    store.loader = true

    try {
        const data = await db.offlineTrades.get(store.orderId)

        if (!data) {
            getTrades.value = []
            store.totalPriceOffline = 0
            store.loader = false
            return
        }

        const trades = data?.trades || []

        const total = trades.reduce((sum, trade) => sum + (trade.price * (trade.quantity || 1)), 0);
        store.totalPriceOffline = total
        getTrades.value = trades
        store.tradesId = data.id

        store.ordersBlance = trades.reduce((sum, item) => {
            const price = item.price * item.quantity
            const discount = item.discount || 0
            return sum + (price - discount)
        }, 0)

    } catch (e) {
        console.error("Ошибочка в tradesGetOffline:", e)
    } finally {
        store.loader = false
    }
}

onMounted(tradesGetOffline)

watch(() => store.orderId, tradesGetOffline)

watch(() => store.ordersLoading, tradesGetOffline)
</script>

<template>
    <div>
        <div class="orders">
            <div class="container">
                <div class="orders-wrapper">
                    <ProductsSearch />

                    <div class="table-wrapper">
                        <table class="product-table">
                            <thead>
                                <tr>
                                    <th><i class="fas fa-bars"></i></th>
                                    <th>Mahsulot</th>
                                    <th>Hajm</th>
                                    <th>Narx</th>
                                    <th>To'lov</th>
                                </tr>
                            </thead>

                            <Order v-for="(item, i) in getTrades" :key="item.id" :item="item" :index="i"
                                :total="getTrades.length" />

                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>