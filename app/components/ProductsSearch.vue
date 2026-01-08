<script setup>
import { ref, onMounted, watch } from 'vue'
import { useStore } from '~/store/store'
import { useUtil } from '~/server/util'
import { db } from '~/server/db'

const { formatUZS, saveRegularProduct } = useUtil()
const store = useStore()

const getCategoriesData = ref([])
const products = ref([])
const allProductsStore = ref([])
const filteredProducts = ref([])

const searchText = ref('')
const searchSwitch = ref(true)
let timeout = null

const getCategoriesOffline = async () => {
    const data = await db.categories.get('categories')
    getCategoriesData.value = data?.list || []
}

const initProducts = async () => {
    const data = await db.products.get('all_products')
    if (data?.list) {
        allProductsStore.value = data.list
        products.value = data.list
    }
}

const handleSearch = () => {
    clearTimeout(timeout)

    timeout = setTimeout(() => {
        const query = searchText.value.toLowerCase().trim()

        if (!query) {
            products.value = [...allProductsStore.value]
            return
        }

        const results = allProductsStore.value.filter(item => {
            const prod = item?.Products
            if (!prod) return false

            const name = prod.product_type?.name?.toLowerCase() || ''
            const name2 = prod.product_type?.name2?.toLowerCase() || ''
            const category = prod.category?.name?.toLowerCase() || ''
            const code = prod.code?.toString() || ''

            return (
                name.includes(query) ||
                name2.includes(query) ||
                category.includes(query) ||
                code.includes(query)
            )
        })

        products.value = results

        if (results.length === 1) {
            const p = results[0]?.Products
            if (p?.code) addTradeOffline(p)
        }
    }, 150)
}

watch(searchText, handleSearch)

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

    searchText.value = ''
    store.ordersLoading = !store.ordersLoading
    store.updateTrade = false
}

const getFilteredProductsOffline = (categoryId) => {
    filteredProducts.value = allProductsStore.value.filter(
        p => p?.Products?.category?.id === categoryId
    )
}

function openProductsMenu() {
    store.modalProductsCategory = false
    store.productDetailShow = true
}

function closeProductsMenu() {
    store.modalProductsCategory = true
    store.productDetailShow = false
}

function closeBothModal() {
    store.productDetailShow = false
    store.productDetailShow = false
}

onMounted(async () => {
    await initProducts()
    await getCategoriesOffline()
})
</script>

<template>
    <div>
        <div class="products">
            <div class="products-wrapper">
                <div class="products-search">
                    <input id="trades-input" type="text" v-model="searchText" @input="handleSearch()"
                        placeholder="Maxsulot izlash">
                    <button class="products-button" @click="store.modalProductsCategory = true">Maxsulotlar</button>
                </div>

                <div class="search-history" :class="{ 'activeHistory': searchText.length }" v-if="searchSwitch">
                    <ul>
                        <li v-for="item in products" :key="item.id">
                            <i @click="saveRegularProduct(item)" class="fas fa-star"></i> <span @click="addTradeOffline(item?.Products)">{{
                                item?.Products?.product_type?.name2 }} - {{ item?.Products?.product_type?.name }}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <ProductsModal v-model="store.modalProductsCategory">
                <div class="modal">
                    <header class="modal-header">
                        <h3>Mahsulotlar</h3>
                        <button class="close-btn" @click="store.modalProductsCategory = false">&times;</button>
                    </header>
                    <div class="modal-prodcuts">
                        <product v-for="item in getCategoriesData"
                            @click="openProductsMenu(), getFilteredProductsOffline(item.id)" :key="item.id"
                            :item="item" />
                    </div>
                </div>
            </ProductsModal>

            <ProductsModal v-model="store.productDetailShow">
                <div class="modal">
                    <header class="modal-header">
                        <h3>Mahsulot</h3>
                        <button class="close-btn" @click="closeProductsMenu()">&times;</button>
                    </header>
                    <div class="products-filtered-by-category">
                        <card v-for="(product, i) in filteredProducts" :key="product.id" :product="product">
                            <button class="add-btn" @click="addTradeOffline(product?.Products), closeBothModal()">
                                Qo'shish
                                <i class="fas fa-plus"></i>
                            </button>
                        </card>
                    </div>
                </div>
            </ProductsModal>
        </div>
    </div>
</template>