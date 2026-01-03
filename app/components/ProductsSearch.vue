<script setup>
import { ref, onMounted, watch } from 'vue';
import { useStore } from '~/store/store';
import { useUtil } from '~/server/util';
import api from '~/server/api';
import { db } from '~/server/db';

const { formatUZS, findError } = useUtil()
const store = useStore()

const getCategoriesData = ref({})
const filteredProducts = ref({})
const products = ref([])
const allProductsStore = ref([])
const searchText = ref('')
const searchSwitch = ref(true)

let timeout;

const getCategoriesOffline = async () => {
    const getCategories = await db.categories.get('categories')
    if (getCategories) {
        getCategoriesData.value = getCategories.list
    }
}

const getCategories = async () => {
    const query = {
        branch_id: store.branchId,
        page: 0,
        limit: 999999
    }
    const res = await api.get_categories(query)
    if (res?.data) {
        await db.categories.put({
            id: 'categories',
            list: res?.data,
            updatedAt: new Date().toISOString()
        })
        await getCategoriesOffline()
    }
}

const initProducts = async () => {
    const localData = await db.products.get('all_products');
    if (localData && localData.list) {
        allProductsStore.value = localData.list;
        products.value = localData.list;
    } else {
        await fetchProducts();
    }
};


const fetchProducts = async () => {
    store.loader = true
    searchSwitch.value = false
    try {
        const res = await api.get_products({
            all_product: true,
            limit: 9999999,
            page: 0
        });

        if (res?.data) {
            await db.products.put({
                id: 'all_products',
                list: res.data,
                updatedAt: new Date().toISOString()
            });
            allProductsStore.value = res.data;
            products.value = res.data;
        }
    } catch (err) {
        findError('signIn', err.response?.status);
    } finally {
        searchSwitch.value = true;
        store.loader = false;
    }
}

const getFilteredProducts = async (id) => {
    const data = { category_id: id, branch_id: store.branchId, limit: 999999 }
    const res = await api.get_filtered_products(data)
    filteredProducts.value = res?.data
}

const handleSearch = () => {
    clearTimeout(timeout);

    timeout = setTimeout(async () => {
        const query = searchText.value.toLowerCase().trim();

        if (query.length === 0) {
            products.value = [...allProductsStore.value];
            return;
        }

        const results = allProductsStore.value.filter(item => {
            const prod = item?.Products;
            if (!prod) return false;

            if (query.length === 13 && query.startsWith('29')) {
                const plu = prod.plu?.toString() || "";
                return plu.includes(query.slice(0, 7));
            } else {
                const name = prod.product_type?.name?.toLowerCase() || "";
                const name2 = prod.product_type?.name2?.toLowerCase() || "";
                const category = prod.category?.name?.toLowerCase() || "";
                const code = prod.code?.toString() || "";

                return name.includes(query) || name2.includes(query) ||
                    code.includes(query) || category.includes(query);
            }
        });

        products.value = results;

        if (results.length === 1) {
            const foundProduct = results[0];
            const code = foundProduct.Products?.code;
            const price = foundProduct.Products?.price;

            if (code) {
                await toTrade(code, price);
            }
        }
    }, 150);
};

watch(searchText, () => {
    handleSearch();
});

const toTrade = async (code, price) => {
    store.ordersLoading = true
    let data = {
        order_id: store.orderId,
        code: code,
        quantity: 1,
        price: price || 0,
        discount: 0
    }

    try {
        await api.to_tarde(data);
        searchText.value = "";
    } catch (err) {
        findError('signIn', err.response?.status);
    } finally {
        store.ordersLoading = false;
        searchSwitch.value = true;
    }
}

const deleteOrder = async () => {
    store.ordersLoading = true;
    store.loader = true;
    try {
        await api.remove_order(store.orderId);
    } catch (err) {
        findError('signIn', err.response?.status)
    } finally {
        store.ordersLoading = false;
        store.loader = false;
    }
}

function openProductsMenu() {
    store.modalProductsCategory = false
    store.productDetailShow = true
}

function closeProductsMenu() {
    store.modalProductsCategory = true
    store.productDetailShow = false
}

onMounted(async () => {
    await initProducts();
    await getCategories();
})
</script>

<template>
    <div>
        <div class="products">
            <div class="products-wrapper">
                <div class="products-search">
                    <input type="text" v-model="searchText" @input="handleSearch()" placeholder="Maxsulot izlash">
                    <!-- <button><i class="fas fa-search"></i></button> -->
                    <button class="products-button" @click="store.modalProductsCategory = true">Maxsulotlar</button>
                </div>


                <div class="search-history" :class="{ 'activeHistory': searchText.length }" v-if="searchSwitch">
                    <ul>
                        <li v-for="item in products" @click="toTrade(item?.Products?.code, item?.Products?.price)">
                            {{ item?.Products?.product_type?.name2 }} - {{ item?.Products?.product_type?.name }}
                        </li>
                    </ul>
                </div>

                <!-- <div class="all-price">
                        <div class="all-price-left">
                            <h3>Umumiy summa: </h3>
                            <h2>{{ formatUZS(store.ordersBlance?.[0]?.balance) }} so'm</h2>
                        </div>
                        <button @click="deleteOrder()"><i class="fa-solid fa-xmark"></i></button>
                    </div> -->

            </div>

            <ProductsModal v-model="store.modalProductsCategory">
                <div class="modal">
                    <header class="modal-header">
                        <h3>Mahsulotlar</h3>
                        <button class="close-btn" @click="store.modalProductsCategory = false">&times;</button>
                    </header>
                    <div class="modal-prodcuts">
                        <product v-for="item in getCategoriesData"
                            @click="openProductsMenu(), getFilteredProducts(item.id)" :key="item" :item="item" />
                    </div>
                </div>
            </ProductsModal>

            <ProductsModal v-model="store.productDetailShow">
                <div class="modal">
                    <header class="modal-header">
                        <h3>Mahsuloti</h3>
                        <button class="close-btn" @click="closeProductsMenu()">&times;</button>
                    </header>

                    <div class="products-search">
                        <input type="text" placeholder="Mahsulot izlash">
                        <button><i class="fas fa-search"></i></button>
                    </div>

                    <div class="products-filtered-by-category">
                        <div class="product-card" v-for="(product, i) in filteredProducts" :key="product.id">
                            <div class="card-header">
                                <span class="product-number">№{{ i + 1 }}</span>
                                <span class="product-code">Kodi: {{ product?.Products?.code }}</span>
                            </div>

                            <div class="card-content">
                                <div class="info-row">
                                    <span class="label">Kategoriya:</span>
                                    <span class="value">{{ product?.Products?.category?.name }}</span>
                                </div>

                                <div class="info-row">
                                    <span class="label">Artikul:</span>
                                    <span class="value">{{ product?.Products?.product_type?.name }}</span>
                                </div>

                                <div class="info-row">
                                    <span class="label">Marka:</span>
                                    <span class="value">{{ product?.Products?.product_type?.name2 }}</span>
                                </div>

                                <div class="info-row highlight">
                                    <span class="label">Qoldiq:</span>
                                    <span class="value">{{ formatUZS(product?.Products?.quantity) }} dona</span>
                                </div>

                                <div class="info-row highlight">
                                    <span class="label">Narx:</span>
                                    <span class="value price">{{ formatUZS(product?.Products?.price) }} so'm</span>
                                </div>
                            </div>

                            <button class="add-btn">
                                <svg class="btn-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.5"
                                        stroke-linecap="round" />
                                </svg>
                                Qo'shish
                            </button>
                        </div>
                    </div>
                </div>
            </ProductsModal>
        </div>
    </div>
</template>