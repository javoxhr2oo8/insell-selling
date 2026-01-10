<script setup>
import { db } from '~/server/db';
import { ref, computed, onMounted, onUnmounted, reactive, watch } from 'vue';
import { useStore } from '~/store/store';
import { useUtil } from '~/server/util';
import { ToastError, ToastSuccess } from '@/composables/toast';
import DropDown from '../elements/dropDown.vue';
import DoubleInput from '../elements/doubleInput.vue';

const emit = defineEmits(['refreshOrders','orderAccept'])


const store = useStore();
const { formatUZS, getSortedRegularProducts } = useUtil();

const sortedProducts = ref([]);
const customers = ref([]);
const searchCustomers = ref("");
const activeSection = ref('INDEX');
const openSearchSwitch = ref(false);
const loadingBtn = ref(false);
const nasiya = ref(0);
const showNasiyaDate = ref(false);
const getTotlePriceCash = ref('');
const getTotlePriceCard = ref('');
const kassa = ref({});

const userData = reactive({
    customer_name: '',
    customer_phone: '',
    discount: 0,
    loan_repayment_date: new Date().toISOString().substr(0, 10),
    loan_comment: ''
});

function clearInputs() {
    userData.customer_name = ''
    userData.customer_phone = ''
    userData.discount = 0
    getTotlePriceCard.value = ''
    getTotlePriceCash.value = ''
    openSearchSwitch.value = false
    store.userAddSwicth = false
    store.getOneUser = {}
}

watch(
    () => store.getOneUser,
    (user) => {
        if (!user) return;
        userData.customer_name = user.name || '';
        userData.customer_phone = user.phone ? String(user.phone) : '';
    },
    { deep: true, immediate: true }
);

async function deleteOrderFromList(orderIdToDelete) {
    if (!orderIdToDelete) return;
    try {
        const data = await db.createOrderOffline.get('createOrderOffline');
        if (!data || !data.list) return;

        const currentIndex = data.list.findIndex(o => String(o.id) === String(orderIdToDelete));
        let nextOrder = null;
        if (data.list.length > 1) {
            nextOrder = currentIndex < data.list.length - 1 ? data.list[currentIndex + 1] : data.list[currentIndex - 1];
        }

        const updatedList = data.list.filter(order => String(order.id) !== String(orderIdToDelete));
        await db.createOrderOffline.update('createOrderOffline', {
            list: updatedList,
            updatedAt: new Date().toISOString()
        });

        if (String(store.orderId) === String(orderIdToDelete)) {
            if (nextOrder) {
                store.orderId = nextOrder.id;
                store.ordinalNumber = nextOrder.ordinal_number;
            } else {
                store.orderId = null;
                store.ordinalNumber = null;
            }
        }
        store.updateOrders = true;
        setTimeout(() => { store.updateOrders = false }, 100);
    } catch (error) {
        console.error("Xatolik:", error);
    }
}

const hasOrder = computed(() => store.offlineOrdersList ? (store.totalPriceOffline || 0) > 0 : (store.ordersBlance?.[0]?.balance || 0) > 0);
const displayTotal = computed(() => store.offlineOrdersList ? (store.totalPriceOffline || 0) : (store.ordersBlance?.[0]?.balance || 0));
const minusPrice = computed(() => (userData.discount || 0) + (nasiya.value || 0));
const amountAfterAll = computed(() => Math.max(0, displayTotal.value - minusPrice.value));

const paymentType = computed(() => {
    if (getTotlePriceCash.value > 0 && getTotlePriceCard.value === 0) return 'CASH';
    if (getTotlePriceCard.value > 0 && getTotlePriceCash.value === 0) return 'CARD';
    return null;
});

function applyDiscountPercent(percent) {
    userData.discount = Math.round((displayTotal.value * percent) / 100);
}

function applyPercentDiscount(event) {
    const percent = parseFloat(event.target.value);
    if (!isNaN(percent)) userData.discount = Math.round((displayTotal.value * percent) / 100);
}

function warningFunc() {
    if (userData.discount > displayTotal.value) {
        userData.discount = displayTotal.value;
        ToastError("Chegirma summadan ko'p bo'lishi!");
    }
}

function handleNasiyaChange() {
    const maxNasiya = displayTotal.value - userData.discount;
    if (nasiya.value > maxNasiya) {
        nasiya.value = Math.max(0, maxNasiya);
        ToastError("Nasiya summasi noto'g'ri!");
    }
    showNasiyaDate.value = nasiya.value > 0;
}

const funcForCash = () => { getTotlePriceCash.value = amountAfterAll.value; getTotlePriceCard.value = 0; };
const funcForCard = () => { getTotlePriceCard.value = amountAfterAll.value; getTotlePriceCash.value = 0; };

const swicthFuncForConfirm = () => activeSection.value = 'CONFIRM';
const openDiscountSection = () => activeSection.value = 'DISCOUNT';
const openNasiyaSectionSwitch = () => activeSection.value = 'NASIYA';
const backFromDiscountFunc = () => activeSection.value = 'CONFIRM';
const swicthFuncBackFromConfirm = () => activeSection.value = 'INDEX';
const closeAllSectionsFunc = () => activeSection.value = 'CLOSED';
const openFirstSection = () => activeSection.value = 'INDEX';

const SectionIndexSwitch = computed({ get: () => activeSection.value === 'INDEX', set: (val) => { if (!val) activeSection.value = 'CLOSED' } });
const SectionIndexConfirmSwitch = computed({ get: () => activeSection.value === 'CONFIRM', set: (val) => { if (!val) activeSection.value = 'INDEX' } });
const sectionDiscountSwitch = computed({ get: () => activeSection.value === 'DISCOUNT', set: (val) => { if (!val) activeSection.value = 'CONFIRM' } });
const nasiyaSectionSwitch = computed({ get: () => activeSection.value === 'NASIYA', set: (val) => { if (!val) activeSection.value = 'CONFIRM' } });
const lastBtnBackToOpenSectionSwitch = computed(() => activeSection.value === 'CLOSED');

const loadProducts = async () => { sortedProducts.value = await getSortedRegularProducts(); };
const getCustomersOffline = async () => {
    const data = await db.get_customers.get('get_customers');
    if (data) customers.value = data.list;
};

const getKassaOffline = async () => {
    const data = await db.get_kassa.get('get_kassa');
    if (data) kassa.value = data.list;
};

const filteredCustomers = computed(() => {
    if (!searchCustomers.value) return customers.value;
    const q = searchCustomers.value.toLowerCase();
    return customers.value.filter(user => (user.name?.toLowerCase().includes(q) || user.phone?.toString().includes(q)));
});

const validateConfirmOrder = () => {
    if (!paymentType.value) return ToastError("To‘lov turini tanlang!"), false;
    if (!store.orderId) return ToastError("Buyurtma topilmadi!"), false;
    if (!hasOrder.value || displayTotal.value <= 0) return ToastError("Mahsulot yo'q!"), false;

    if (nasiya.value > 0) {
        if (!userData.customer_name?.trim()) return ToastError("Mijoz ismini kiriting!"), false;
        if (!userData.customer_phone || String(userData.customer_phone).length < 7) return ToastError("Telefon raqami xato!"), false;
    }

    if (!kassa.value?.[0]?.Kassa?.id) return ToastError("Kassa topilmadi!"), false;
    return true;
};

const confirmOrder = async () => {
    if (!validateConfirmOrder()) return;
    loadingBtn.value = true;

    const isCash = paymentType.value === 'CASH';
    const payload = {
        order_id: store.orderId,
        customer_name: userData.customer_name.trim(),
        customer_phone: Number(String(userData.customer_phone).replace(/\D/g, '')),
        discount: userData.discount,
        money: [{
            paid_money: amountAfterAll.value,
            kassa_id: isCash ? kassa.value[1].Kassa.id : kassa.value[0].Kassa.id,
            currency_id: isCash ? kassa.value[1].Kassa.currency.id : kassa.value[0].Kassa.currency.id
        }],
        loan_repayment_date: nasiya.value > 0 ? userData.loan_repayment_date : null,
        loan_comment: nasiya.value > 0 ? (userData.loan_comment?.trim() || '') : '',
        seller_id: store.sellerId,
        service_id: 0,
        service_price: 0,
    };

    try {
        const existingData = await db.orders_confirm.get('orders_confirm');
        const list = existingData?.list || [];
        list.push(payload);
        await db.orders_confirm.put({ id: 'orders_confirm', list });
        await deleteOrderFromList(store.orderId);
        ToastSuccess("Tasdiqlandi");
        clearInputs()
        activeSection.value = 'INDEX';
        emit('refreshOrders')
        emit('orderAccept')
      
    } catch (error) {
        console.log(error);

    } finally {
        loadingBtn.value = false;
    }
};

onMounted(() => {
    loadProducts();
    getCustomersOffline();
    getKassaOffline();
    window.addEventListener('regular-products-updated', loadProducts);
});

onUnmounted(() => {
    window.removeEventListener('regular-products-updated', loadProducts);
});

watch(() => store.updateRegularProducts, loadProducts);
</script>

<template>
    <SectionIndex v-model="SectionIndexSwitch" :minusPrice="minusPrice" :finalPayable="displayTotal">
        <template #back-btn>
            <button @click="closeAllSectionsFunc()"><img src="../../assets/images/png/back-icon-orange.png"></button>
        </template>
        <span class="regular-products-title">Doimiy mahsulotlar:</span>
        <div class="regualr-products-wrapper">
            <RegularProduct v-for="(product, index) in sortedProducts" :key="product.id" :product="product"
                :index="index" />
        </div>
        <template #footer-actions>
            <button class="payment-footer-btn" @click="swicthFuncForConfirm()" :disabled="!hasOrder">To'lov</button>
            <div class="footer-bottom-actions">
                <button @click="openDiscountSection()" :disabled="!hasOrder"><i class="fas fa-tag"></i></button>
                <button @click="openNasiyaSectionSwitch()" :disabled="!hasOrder"><i
                        class="fas fa-calendar"></i></button>
            </div>
        </template>
    </SectionIndex>

    <SectionIndex v-model="SectionIndexConfirmSwitch" :minusPrice="minusPrice" :finalPayable="displayTotal">
        <template #back-btn>
            <button @click="swicthFuncBackFromConfirm()"><img
                    src="../../assets/images/png/back-icon-orange.png"></button>
        </template>

        <div class="users-info">
            <button @click="openSearchSwitch = !openSearchSwitch, store.userAddSwicth = false">Mijozlar</button>
            <div class="search-users-and-new-user-btn" v-if="openSearchSwitch">
                <label for="info-users">Qidiruv</label>
                <div class="search-users-info-search">
                    <input id="info-users" type="text" v-model="searchCustomers">
                    <button @click="store.userAddSwicth = !store.userAddSwicth"
                        :class="{ 'select-user-button': store.userAddSwicth }"><img v-if="!store.userAddSwicth"
                            src="../../assets/images/png/new-user-icon.png"><i v-if="store.userAddSwicth"
                            class="fas fa-user"></i></button>
                </div>
                <DropDown v-if="!store.userAddSwicth" :data="filteredCustomers" />
            </div>
            <DoubleInput :title="store.getOneUser.name ? 'Mijoz' : 'Yangi mijoz'" v-if="store.userAddSwicth">
                <div class="section-input-wrapper"><input type="text" v-model="userData.customer_name"
                        placeholder="Mijoz ismi">
                </div>
                <div class="section-input-wrapper"><input type="text" v-model="userData.customer_phone"
                        placeholder="Telefon raqam">
                </div>
            </DoubleInput>
        </div>

        <DoubleInput title="Tolov" v-if="!store.userAddSwicth">
            <div class="section-input-wrapper">
                <input v-model.number="getTotlePriceCash" type="number" placeholder="Naqd">
                <button @click="funcForCash()"><i class="fas fa-magnet"></i></button>
            </div>
            <div class="section-input-wrapper">
                <input v-model.number="getTotlePriceCard" type="number" placeholder="Plastik">
                <button @click="funcForCard()"><i class="fas fa-magnet"></i></button>
            </div>
        </DoubleInput>

        <template #footer-actions>
            <button class="payment-footer-btn" @click="confirmOrder" :disabled="loadingBtn">Tasdiqlash</button>
            <div class="footer-bottom-actions">
                <button @click="openDiscountSection()"><i class="fas fa-tag"></i></button>
                <button @click="openNasiyaSectionSwitch()"><i class="fas fa-calendar"></i></button>
            </div>
        </template>
    </SectionIndex>

    <SectionIndex v-model="sectionDiscountSwitch" :minusPrice="minusPrice" :finalPayable="displayTotal">
        <template #back-btn>
            <button @click="backFromDiscountFunc()"><img src="../../assets/images/png/back-icon-orange.png"></button>
        </template>

        <div class="sections-payment">
            <span>Chegirma</span>
            <div class="sections-payment-inputs">
                <div class="sections-payment-input">
                    <input type="number" v-model.number="userData.discount" @input="warningFunc" placeholder="Summada">
                    <button><span>so'm</span></button>
                </div>
                <div class="sections-payment-input">
                    <input type="number"
                        :value="displayTotal > 0 ? ((userData.discount / displayTotal) * 100).toFixed(0) : 0"
                        @input="applyPercentDiscount($event)" placeholder="Foizda">
                    <button><span>%</span></button>
                </div>
            </div>
            <div class="discount-cards">
                <div v-for="pct in [5, 10]" :key="pct" class="discount-card" @click="applyDiscountPercent(pct)">
                    <h2>-{{ pct }}%</h2>
                </div>
            </div>
        </div>

        <template #footer-actions>
            <button class="payment-footer-btn" @click="backFromDiscountFunc()">Tasdiqlash</button>
            <div class="footer-bottom-actions">
                <button class="section-active"><i class="fas fa-tag"></i></button>
                <button @click="openNasiyaSectionSwitch()"><i class="fas fa-calendar"></i></button>
            </div>
        </template>
    </SectionIndex>

    <SectionIndex v-model="nasiyaSectionSwitch" :minusPrice="minusPrice" :finalPayable="displayTotal">
        <template #back-btn>
            <button @click="backFromDiscountFunc()"><img src="../../assets/images/png/back-icon-orange.png"></button>
        </template>

        <div class="users-info">
            <button @click="openSearchSwitch = !openSearchSwitch">Mijozlar</button>
            <div class="search-users-and-new-user-btn" v-if="openSearchSwitch">
                <div class="search-users-info-search">
                    <input type="text" v-model="searchCustomers" placeholder="Qidiruv...">
                </div>
                <DropDown v-if="!store.userAddSwicth" :data="filteredCustomers" />
            </div>
        </div>

        <div class="sections-payment">
            <span>Nasiya summasi</span>
            <div class="sections-payment-inputs">
                <div class="sections-payment-input">
                    <input type="number" v-model.number="nasiya" @input="handleNasiyaChange" placeholder="Summa">
                    <button><i class="fas fa-calendar"></i></button>
                </div>
            </div>
        </div>

        <div class="nasiya" v-if="showNasiyaDate">
            <span>Qaytarish muddati</span>
            <div class="nasiya-input-wrapper">
                <input type="date" v-model="userData.loan_repayment_date">
            </div>
        </div>

        <template #footer-actions>
            <button class="payment-footer-btn" @click="backFromDiscountFunc()">Tasdiqlash</button>
            <div class="footer-bottom-actions">
                <button @click="openDiscountSection()"><i class="fas fa-tag"></i></button>
                <button class="section-active"><i class="fas fa-calendar"></i></button>
            </div>
        </template>
    </SectionIndex>

    <button class="open-section-btn" v-if="lastBtnBackToOpenSectionSwitch" @click="openFirstSection()">
        <img src="../../assets/images/png/back-icon.png">
    </button>

</template>

<style lang="scss" scoped>
.regular-products-title {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px 0;
    font-weight: 600;
    color: var(--dark-color);
    opacity: 0.9;
    font-size: 32px;
}

.select-user-button {
    padding: 0 13.5px !important;

    i {
        color: var(--pr-color);
        font-size: 30px;
    }
}

.regualr-products-wrapper {
    display: flex;
    flex-direction: column;
    gap: 5px;
    overflow: auto;
    height: 400px;
    padding: 10px;
}

.regualr-products-wrapper::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

.regualr-products-wrapper::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.regualr-products-wrapper::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
    border: 2px solid #f1f1f1;
}

.regualr-products-wrapper::-webkit-scrollbar-thumb:hover {
    background: #555;
}

.open-section-btn {
    height: 75vh;
    padding: 0 15px;
    border-radius: 5px;
    background: var(--pr-color);
    border: none;
    margin-right: 18px;
    cursor: pointer;
    transition: all .2s ease;

    &:hover {
        opacity: 0.7;
    }

    &:active {
        transform: scale(99%);
    }
}

.users-info {
    margin-top: 15px;
    position: relative;

    button {
        width: 100%;
        padding: 10px;
        font-size: 25px;
        background: transparent;
        border: 1px solid #c9c9c9;
        border-radius: 10px;
        color: #c9c9c9;
        cursor: pointer;
        transition: all .2s ease;

        &:hover {
            opacity: 0.8;
        }

        &:active {
            transform: scale(98%);
        }
    }

    .search-users-and-new-user-btn {
        margin-top: 20px;
        position: relative;

        label {
            color: #c9c9c9;
        }
    }

    .search-users-info-search {
        display: flex;
        gap: 10px;
        margin-top: 10px;

        input {
            width: 100%;
            background: transparent;
            border: 1px solid #c9c9c9;
            padding: 15px;
            outline: none;
            color: var(--dark-color);
            font-size: 20px;
            border-radius: 10px;
        }

        button {
            width: fit-content;
            padding: 10px;
            display: flex;
            align-items: center;
            justify-content: center;

            img {
                width: 35px;
            }
        }
    }
}

.users-info-items {
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: 260px;
    margin-top: 20px;
    overflow: auto;
    position: absolute;
    width: 100%;
    background: var(--bg-color);
    padding: 15px;
    border-radius: 10px;
    z-index: 10;

    .user-info-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: 10px;
        border: 1px solid #c9c9c9;
        cursor: pointer;
        transition: all .2s ease;

        &:hover {
            background: var(--pr-color);
            color: white;

            h2 {
                color: white;
            }
        }

        h2 {
            font-size: 20px;
            color: #c9c9c9;
            padding: 15px;
        }
    }
}

.selected-client {
    margin-top: 10px;
    padding: 10px;
    background: var(--pr-color);
    color: white;
    border-radius: 10px;
    text-align: center;
}

.sections-payment {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;

    span {
        font-weight: 600;
        font-size: 33px;
        color: var(--pr-color);
    }

    .order-summary {
        width: 100%;
        margin: 15px 0;
        padding: 15px;
        border: 1px solid #e0e0e0;
        border-radius: 10px;
        background: var(--table-head-color);

        .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 18px;

            &.total {
                margin-top: 10px;
                padding-top: 10px;
                border-top: 2px solid var(--pr-color);
                font-weight: bold;
                font-size: 22px;
            }

            span {
                font-size: 18px;
                color: #666;
            }

            strong {
                font-size: 18px;
                color: var(--dark-color);
            }
        }
    }

    .sections-payment-inputs {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 13px;
        margin-top: 10px;

        .sections-payment-input {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 10px;

            input {
                width: 100%;
                padding: 10px;
                font-weight: 600;
                font-size: 24px;
                color: var(--dark-color);
                border: 1px solid #c9c9c9;
                background: none;
                outline: none;
                border-radius: 10px;
            }

            .select-option-wrp {
                display: flex;
                gap: 5px;

                select {
                    padding: 10px;
                    border: 1px solid #c9c9c9;
                    background: none;
                    border-radius: 10px;
                    color: var(--dark-color);
                    min-width: 200px;
                }

                button {
                    padding: 10px 15px;
                    background: none;
                    border: 1px solid #c9c9c9;
                    cursor: pointer;
                    border-radius: 10px;

                    i {
                        font-size: 20px;
                        color: var(--dark-color);
                    }
                }
            }

            button {
                padding: 10px;
                background: none;
                border: 1px solid #c9c9c9;
                cursor: pointer;
                border-radius: 10px;

                span {
                    width: 50px;
                    padding: 2px;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--dark-color);
                }

                i {
                    font-size: 28px;
                    color: #c9c9c9;
                }
            }
        }
    }
}

.balance-info {
    margin-top: 20px;
    padding: 15px;
    border: 1px solid #c9c9c9;
    border-radius: 10px;
    width: 100%;
    text-align: center;

    strong {
        font-size: 24px;
        color: var(--pr-color);
    }
}

.discount-cards {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-top: 20px;

    .discount-card {
        width: 100%;
        padding: 15px;
        border: 1px solid #c9c9c9;
        color: #c9c9c9;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        cursor: pointer;
        transition: all .2s ease;

        &:hover {
            opacity: 0.9;
            background: var(--pr-color);
            color: #fff;
        }

        &:active {
            transform: scale(98%);
        }
    }
}

.section-active {
    background: var(--pr-color) !important;

    i {
        color: #fff !important;
    }
}

.nasiya {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-top: 20px;

    span {
        font-size: 25px;
        color: var(--pr-color);
    }

    .nasiya-input-wrapper {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 5px;

        input {
            padding: 10px;
            width: 100%;
            font-size: 20px;
            border-radius: 10px;
            border: 1px solid #c9c9c9;
            background: transparent;
            color: var(--dark-color);

            &::-webkit-calendar-picker-indicator {
                cursor: pointer;
                filter: invert(1);
            }
        }

        button {
            padding: 10px 13px;
            border: 1px solid #c9c9c9;
            background: none;
            border-radius: 10px;

            i {
                font-size: 27px;
                color: #c9c9c9;
            }
        }
    }
}

.payment-footer-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.active-discount {
    background: var(--pr-color) !important;
    color: #fff !important;
    border-color: var(--pr-color) !important;
}

.order-total {
    margin: 10px 0;
    padding: 10px;
    background: #f0f0f0;
    border-radius: 10px;
    text-align: center;

    strong {
        font-size: 20px;
        color: var(--dark-color);
    }
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>