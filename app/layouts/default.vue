<script setup>
import { db } from '~/server/db';
import api from '~/server/api';
import { useStore } from '~/store/store';
import { useUtil } from '~/server/util';
import { ref, onMounted } from 'vue';

const { findError } = useUtil()
const store = useStore()
const isLoading = ref(false)

const tokenCookie = useCookie('access_token');

const refreshToken = async () => {
    try {
        const res = await api.refresh_token(tokenCookie.value);
        if (res?.access_token) {
            tokenCookie.value = res.access_token;
            return true;
        }
    } catch (error) {
        console.log('Refresh error:', error);
    }
    return false;
}

const loadAllData = async () => {
    if (isLoading.value) return

    isLoading.value = true
    store.updateLocalBase = true

    const requests = [
        {
            name: 'products',
            apiCall: () => api.get_products({
                branch_id: store.branchId,
                all_products: true,
                limit: 99999999
            }),
            dbTable: 'products',
            dbId: 'all_products'
        },
        {
            name: 'categories',
            apiCall: () => api.get_categories({
                branch_id: store.branchId,
                limit: 99999999
            }),
            dbTable: 'categories',
            dbId: 'categories'
        },
        {
            name: 'customers',
            apiCall: () => api.get_customers({
                branch_id: store.branchId,
                limit: 99999999
            }),
            dbTable: 'get_customers',
            dbId: 'get_customers'
        },
        {
            name: 'kassa',
            apiCall: () => api.get_kassa({ branch_id: store.branchId }),
            dbTable: 'get_kassa',
            dbId: 'get_kassa'
        },
        {
            name: 'services',
            apiCall: () => api.get_services({
                branch_id: store.branchId,
                page: 0,
                limit: 25,
            }),
            dbTable: 'get_services',
            dbId: 'get_services'
        }
    ]

    try {
        const results = await Promise.allSettled(
            requests.map(async (req) => {
                try {
                    console.log(`📥 Загружаем ${req.name}...`)

                    const res = await req.apiCall()

                    if (res?.data || res) {
                        await db[req.dbTable].put({
                            id: req.dbId,
                            list: res.data || res
                        })
                        console.log(`✅ ${req.name} сохранен`)
                        return { name: req.name, success: true }
                    }
                } catch (error) {
                    console.error(`❌ Ошибка загрузки ${req.name}:`, error)
                    if (error.status == 401) {
                        await refreshToken()
                    }
                    return { name: req.name, success: false, error }
                }
            })
        )

        const successful = results.filter(r => r.value?.success)
        const failed = results.filter(r => !r.value?.success)

        console.log(`🎯 Завершено: ${successful.length} успешно, ${failed.length} с ошибками`)

    } catch (error) {
        console.error('❌ Общая ошибка загрузки:', error)
    } finally {
        isLoading.value = false
        store.updateLocalBase = false
    }
}

onMounted(() => {
    loadAllData()
})

const refreshData = async () => {
    await loadAllData()
}
</script>

<template>
    <div>
        <NuxtPage />
        <SendingIndicator :isActive="isSending" color="var(--pr-color)" />
    </div>
</template>