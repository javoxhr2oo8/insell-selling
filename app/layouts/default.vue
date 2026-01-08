<script setup>
import { db } from '~/server/db';
import api from '~/server/api';
import { useStore } from '~/store/store';
import { useUtil } from '~/server/util';
import SendingIndicator from '~/components/SendingIndicator.vue';

const { findError } = useUtil()

const isSending = ref(false)

const store = useStore()

const getAllProducts = async () => {
    const data = {
        branch_id: store.branchId,
        all_products: true,
        limit: 99999999
    }
    const res = await api.get_products(data).catch((err) => {
        findError('signIn', err.status)
    })

    if (res) {
        db.products.put({
            id: 'all_products',
            list: res?.data
        })
    }
}

const getCategories = async () => {
    const data = {
        branch_id: store.branchId,
        limit: 99999999
    }
    const res = await api.get_categories(data)

    if (res) {
        db.categories.put({
            id: 'categories',
            list: res?.data
        })
    }
}

const getUsers = async () => {
    const data = {
        branch_id: store.branchId,
        limit: 99999999
    }
    const res = await api.get_customers(data)

    if (res) {
        db.get_customers.put({
            id: 'get_customers',
            list: res?.data
        })
    }
}

const getKassa = async ()=> {
    const data = {
        branch_id: store.branchId
    }

    const res = await api.get_kassa(data)

    console.log(res)

    if(res) {
        db.get_kassa.put({
            id: 'get_kassa',
            list: res
        })
    }
}

onMounted(() => {
    getAllProducts()
    getCategories()
    getUsers()
    getKassa()
})
</script>

<template>
    <div>
        <NuxtPage />
        <SendingIndicator :isActive="isSending" color="var(--pr-color)" />
    </div>
</template>