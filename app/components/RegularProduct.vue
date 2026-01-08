<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from '~/store/store';
import { useUtil } from '~/server/util';
import { db } from '~/server/db';

const { product, index } = defineProps(['product', 'index'])

const store = useStore()
const { formatUZS, saveRegularProduct, reorderRegularProducts } = useUtil()

const starSwitch = ref(false)
const loading = ref(false)
const isDragging = ref(false)
const dragOver = ref(false)

const checkFunc = async () => {
    try {
        const data = await store.db.regular_products.get('regular_products')
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

const startDrag = (event) => {
    isDragging.value = true
    event.dataTransfer.setData('text/plain', JSON.stringify({
        productId: product?.Products?.id,
        index: index
    }))
    event.dataTransfer.effectAllowed = 'move'
}

const handleDragOver = (event) => {
    event.preventDefault()
    if (isDragging.value) return
    dragOver.value = true
}

const handleDrop = async (event) => {
    event.preventDefault()
    dragOver.value = false

    if (isDragging.value) return

    try {
        const dragData = JSON.parse(event.dataTransfer.getData('text/plain'))
        const draggedId = dragData.productId
        const targetId = product?.Products?.id

        if (!draggedId || !targetId || draggedId === targetId) return

        await reorderRegularProducts(draggedId, targetId)
        window.dispatchEvent(new CustomEvent('regular-products-reordered'))

    } catch (error) {
        console.error('Ошибка при перетаскивании:', error)
    }
}

const handleDragLeave = () => {
    dragOver.value = false
}

const handleDragEnd = () => {
    isDragging.value = false
    dragOver.value = false
}

onMounted(async () => {
    await updateStarStatus()
})

const handleStarClick = async (event) => {
    event.stopPropagation()
    if (loading.value) return

    loading.value = true
    try {
        await saveRegularProduct(product)
        await updateStarStatus()
        window.dispatchEvent(new CustomEvent('regular-products-updated'))
    } catch (error) {
        console.error('Ошибка при сохранении:', error)
    } finally {
        loading.value = false
    }
}

const addTradeOffline = async (product) => {
    if (!store.orderId) return

    store.updateTrade = true

    let data = await db.offlineTrades.get(store.orderId)
    if (!data) data = { id: store.orderId, trades: [] }

    const trades = data.trades || []

    const exists = trades.find(t => t.Products?.code === product.code)
    let updatedTrades = []

    const clonedProduct = JSON.parse(JSON.stringify(product))

    if (exists) {
        updatedTrades = trades.map(t =>
            t.Products.code === product.code
                ? { ...t, quantity: t.quantity + 1 }
                : t
        )
        console.log("Added to quantity")
    } else {
        updatedTrades = [
            ...trades,
            {
                id: crypto.randomUUID(),
                Products: clonedProduct,
                quantity: 1,
                price: product.price,
                discount: 0
            }
        ]
    }

    await db.offlineTrades.put({
        id: store.orderId,
        trades: updatedTrades,
        updatedAt: new Date().toISOString()
    })

    store.ordersLoading = !store.ordersLoading
    store.updateTrade = false
}
</script>

<template>
    <div class="regualr-product" :class="{ 'star-active-class': starSwitch, 'drag-over': dragOver }" draggable="true"
        @dragstart="startDrag" @dragover.prevent="handleDragOver" @drop="handleDrop" @dragleave="handleDragLeave"
        @dragend="handleDragEnd">
        <div class="regular-product-overlay" @click="addTradeOffline(product?.Products)"></div>
        <button class="drag-btn"><i class="fas fa-bars"></i></button>
        <h2>
            {{ product?.Products?.product_type?.name }} - {{ product?.Products?.category?.name }}
        </h2>
        <button @click="handleStarClick" class="star-btn-def">
            <i class="fas fa-star"></i>
        </button>
    </div>
</template>

<style lang="scss" scoped>
.star-btn-def {
    i {
        color: var(--pr-color) !important;
        -webkit-text-stroke: 2px var(--pr-color) !important;
    }
}

.regualr-product {
    width: 100%;
    background: rgba(104, 103, 103, 0.596);
    color: #fff;
    padding: 13px;
    border-radius: 10px;
    cursor: pointer;
    transition: all .2s ease;
    margin-bottom: 8px;
    position: relative;
    z-index: 0;
    display: flex;
    align-items: center;
    gap: 10px;

    .regular-product-overlay {
        width: 100%;
        height: 56px;
        border-radius: 10px;
        position: absolute;
        left: 0;
        background: transparent;
        z-index: 20;
    }

    &.drag-over {
        background: rgba(221, 127, 20, 0.3);
        border: 2px dashed var(--pr-color);
        transform: translateY(-2px);
    }

    button {
        border: none;
        background: none;
        cursor: pointer;

        &:last-child {
            right: 10px;
            position: absolute;
            z-index: 20;
        }

        i {
            font-size: 22px;
            color: #fff;
        }

        &.drag-btn {
            cursor: grab;

            &:active {
                cursor: grabbing;
            }

            i {
                opacity: 0.7;
                transition: opacity 0.2s;
            }

            &:hover i {
                opacity: 1;
            }
        }

        &.star-btn {
            cursor: pointer;

            i {
                color: transparent;
                -webkit-text-stroke: 2px #fff;
                transition: all 0.2s;
            }

            &:hover:not(:disabled) i {
                transform: scale(1.1);
            }

            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        }
    }

    h2 {
        font-size: 25px;
        margin: 0;
        flex-grow: 1;
        padding: 0 15px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &:hover {
        opacity: 0.7;
    }

    &:active:not(.drag-over) {
        transform: scale(98%);
    }
}

@keyframes pulse-border {
    0% {
        border-color: var(--pr-color);
    }

    50% {
        border-color: var(--pr-color);
    }

    100% {
        border-color: var(--pr-color);
    }
}

.drag-over {
    animation: pulse-border 1s infinite;
}
</style>