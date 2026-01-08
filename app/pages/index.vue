<script setup>
import api from '~/server/api';
import { useStore } from '~/store/store';

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

onMounted(() => {
    getUsers()
})
</script>

<template>
    <div>
        <Header />
        <AddOrder />
        <div class="orders-and-total-price-wrapper">
            <Orders class="orders-component" />
            <RightSections/>
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