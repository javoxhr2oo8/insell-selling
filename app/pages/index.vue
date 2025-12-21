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

const getUsers = async ()=> {
    const res = await api.get_users(data)
    store.sellerId = res?.data[0]?.id
    store.customerName = res?.data[0]?.name
    store.customerPhone = res?.data[0]?.phone
}


onMounted(()=> {
    getUsers()
})
</script>

<template>
    <div>
        <Header />
        <AddOrder />
        <ProductsSearch />
        <Orders />
        <confirm />
    </div>
</template>

<style></style>