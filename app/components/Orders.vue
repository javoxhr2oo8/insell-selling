<script setup>
import api from '~/server/api';
import { useStore } from '~/store/store';
import { useUtil } from '~/server/util';

const store = useStore();

const { findError } = useUtil()

const getTrades = ref({})

const tradesGet = async () => {
    store.loader = true
    const res = await api.get_trades(store.orderId, store.branchId).catch(err => {
        findError('signIn', err.response?.status)
    })
    store.ordersBlance = res?.order_balances
    getTrades.value = res?.trades
    store.loader = false
    console.log(res)
}

onMounted(() => {
    tradesGet()
})

watch(()=> store.ordersLoading, ()=> {
    tradesGet()
})

watchEffect(()=> {
    tradesGet()
})
</script>

<template>
    <div>
        <div class="orders">
            <div class="container">
                <div class="orders-wrapper">
                    <table class="product-table">
                        <thead>
                            <tr>
                                <th>№</th>
                                <th>Mahsulot</th>
                                <th>Hajm</th>
                                <th>Narx</th>
                                <th>Chegirma</th>
                                <th>To'lov</th>
                            </tr>
                        </thead>

                        <Order v-for="(item, i) in getTrades" :key="item" :item="item" :index="i" />

                    </table>
                </div>
            </div>
        </div>
    </div>
</template>