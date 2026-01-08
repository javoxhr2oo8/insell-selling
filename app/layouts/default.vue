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

onMounted(() => {
    getAllProducts()
    getCategories()
    getUsers()
})
</script>

<template>
    <div>
        <NuxtPage />
        <SendingIndicator :isActive="isSending" color="var(--pr-color)" />
    </div>
</template>