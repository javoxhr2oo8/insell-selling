<script setup>
import { ref, onMounted } from 'vue';
import { useUtil } from '~/server/util';
import { db } from '~/server/db';

const { formatUZS, saveRegularProduct } = useUtil()
const { product } = defineProps(['product'])

const starSwitch = ref(false)
const loading = ref(false)

const checkFunc = async () => {
    try {
        const data = await db.regular_products.get('regular_products')
        const currentProductId = product?.Products?.id

        if (!data?.list || !Array.isArray(data.list) || !currentProductId) {
            return false
        }

        return data.list.some(item =>
            item?.Products?.id === currentProductId
        )

    } catch (error) {
        console.error('Ошибка:', error)
        return false
    }
}

const updateStarStatus = async () => {
    starSwitch.value = await checkFunc()
}

onMounted(async () => {
    await updateStarStatus()
})

const handleStarClick = async () => {
    if (loading.value) return

    loading.value = true
    try {
        await saveRegularProduct(product)

        await updateStarStatus()

    } catch (error) {
        console.error('Ошибка при сохранении:', error)
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="product-card">
        <div class="card-content">
            <div class="info-row">
                <h2>{{ product?.Products?.product_type?.name }}</h2>
                <button @click="handleStarClick" class="star-btn" :class="{ 'star-btn-active': starSwitch }"
                    :disabled="loading">
                    <i class="fas fa-star"></i>
                </button>
            </div>
            <div class="info-row">
                <span class="label">Kategoriya:</span>
                <span class="value">{{ product?.Products?.category?.name }}</span>
            </div>

            <div class="info-row highlight">
                <span class="label">Narx:</span>
                <span class="value price">{{ formatUZS(product?.Products?.price) }} {{
                    product?.Products?.currency?.currency }}</span>
            </div>

            <slot />
        </div>
    </div>
</template>

<style scoped>
.star-btn-active i {
    color: var(--pr-color) !important;
}
</style>