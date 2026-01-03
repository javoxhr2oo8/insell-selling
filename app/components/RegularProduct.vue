<script setup>
import api from '~/server/api';
import { useStore } from '~/store/store';
import { useUtil } from '~/server/util';


const { product } = defineProps(['product'])

const store = useStore()
const { formatUZS } = useUtil()

const toTrade = async (code, price) => {
    store.ordersLoading = true;
    let data = {
        order_id: store.orderId,
        code: code,
        quantity: 1,
        price: price || 0,
        discount: 0
    }
    const res = await api.to_tarde(data)

    store.ordersLoading = false
}
</script>

<template>
    <div class="regualr-product" @click="toTrade(product?.Products?.code, product?.Products?.price)">
        <h2>
            <pre>{{ product?.Products?.product_type?.name }}</pre>
        </h2>
    </div>
</template>

<style lang="scss" scoped>
.regualr-product {
    width: 100%;
    background: rgba(104, 103, 103, 0.596);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: all .2s ease;

    &:hover {
        opacity: 0.7;
    }

    &:active {
        transform: scale(95%);
    }

    h2 {
        font-size: 25px;
    }
}
</style>