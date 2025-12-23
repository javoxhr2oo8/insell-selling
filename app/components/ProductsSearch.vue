<script setup>
import { useStore } from '~/store/store';
import { useUtil } from '~/server/util';
import api from '~/server/api';

const { formatUZS, findError } = useUtil()

const store = useStore()

const products = ref([])
const searchText = ref('')
const searchSwitch = ref(true)

const fetchProducts = async () => {
    store.loader = true
    searchSwitch.value = false
    const res = await api.get_products({
        search: searchText.value,
        limit: 20,
        page: 0
    }).catch(err => {
        findError('signIn', err.response?.status)
    })
    console.log(res)
    searchSwitch.value = true
    products.value = res?.data
    store.loader = false
}

let timeout;
const handleSearch = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        fetchProducts();
    }, 500);
};

const toTrade = async (code, price) => {
    store.ordersLoading = true
    let data = {
        order_id: store.orderId,
        code: code,
        quantity: 1,
        price: price,
        discount: 0
    }
    const res = await api.to_tarde(data).catch(err => {
        findError('signIn', err.response?.status)
    })
    searchText.value = ""
    store.ordersLoading = false
    searchSwitch.value = false
}

const deleteOrder = async () => {
    store.ordersLoading = true
    store.loader = true
    const res = await api.remove_order(store.orderId).catch(err => {
        findError('signIn', err.response?.status)
    })
    store.ordersLoading = false
    store.loader = false
    console.log(res)
}

// async function backModalFunc() {
//     store.modalProducts = true
//     store.productDetailShow = false
// }
</script>

<template>
    <div>
        <div class="products">
            <div class="container">
                <div class="products-wrapper">
                    <div class="products-search">
                        <input type="text" v-model="searchText" @input="handleSearch" placeholder="Mahsulot izlash">
                        <button><i class="fas fa-search"></i></button>
                    </div>

                    <div class="search-history" :class="{ 'activeHistory': searchText.length }" v-if="searchSwitch">
                        <ul>
                            <h2>Natija</h2>
                            <li v-for="item in products" @click="toTrade(item?.Products?.code, item?.Products?.price)">
                                {{ item?.Products?.product_type?.name }}</li>
                        </ul>
                    </div>

                    <!-- <button class="products-btn" @click="store.modalProducts = true">Mahsulotlar</button> -->
                    <div class="all-price">
                        <div class="all-price-left">
                            <h3>Umumiy summa: </h3>
                            <h2>{{ formatUZS(store.ordersBlance?.[0]?.balance) }} so'm</h2>
                        </div>
                        <button @click="deleteOrder()"><i class="fa-solid fa-trash"></i></button>
                    </div>

                </div>
            </div>

            <!-- <ProductsModal v-model="store.modalProducts">
                <div class="modal">
                    <header class="modal-header">
                        <h3>Mahsulotlar</h3>
                        <button class="close-btn" @click="store.modalProducts = false">&times;</button>
                    </header>
                    <div class="modal-prodcuts">
                        <product v-for="item in 20" :key="item" :item="item" />
                    </div>
                </div>
            </ProductsModal> -->

            <!-- <ProductsModal v-model="store.productDetailShow">
                <div class="modal">
                    <header class="modal-header">
                        <h3>Mahsuloti</h3>
                        <button class="close-btn" @click="backModalFunc()">&times;</button>
                    </header>

                    <div class="products-search">
                        <input type="text" placeholder="Mahsulot izlash">
                        <button><i class="fas fa-search"></i></button>
                    </div>

                    <div class="orders product-detail-table">
                        <div class="container">
                            <div class="orders-wrapper">
                                <table class="product-table">
                                    <thead>
                                        <tr>
                                            <th>№</th>
                                            <th>Kodi</th>
                                            <th>Kategoriya</th>
                                            <th>Artikul</th>
                                            <th>Marka</th>
                                            <th>Polka</th>
                                            <th>Qoldiq</th>
                                            <th>Narx</th>
                                        </tr>
                                    </thead>

                                    <productDetailTable v-for="item in 10" :key="item" :item="item"/>

                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </ProductsModal> -->
        </div>
    </div>
</template>