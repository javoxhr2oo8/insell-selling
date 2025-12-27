<script setup>
import { useUtil } from '~/server/util';
import { useStore } from '~/store/store';
import api from '~/server/api';

const { item } = defineProps(['item', 'index'])

// const saleSwitch = ref(item?.Trades?.discount ? true : false)
const saleSwitch = ref(false)

const editNameAndCategory = ref(false)

const store = useStore()

const { formatUZS, findError } = useUtil()

const price = ref(item?.Trades?.price)
const discount = ref(item?.Trades?.discount)

const discountType = ref("sum");

const discountValue = ref(item?.Trades?.discount || 0);

const calculatedDiscount = computed(() => {
    const basePrice = query.price * query.quantity;
    if (discountType.value === 'percent') {
        const percent = Math.min(Math.max(discountValue.value, 0), 100);
        return (basePrice * percent) / 100;
    }
    return discountValue.value;
});

const addBtnDefault = ref(true)
const remBtnDefault = ref(true)
const addBtnLoading = ref(false)
const rembtnLoading = ref(false)

const query = reactive({
    quantity: item?.Trades?.quantity,
    price: price,
    discount: discount
})

const displayPrice = computed({
    get() {
        return new Intl.NumberFormat('ru-RU').format(price.value || 0);
    },
    set(val) {
        const num = Number(val.replace(/\D/g, ''));
        price.value = num;
    }
});

const displayDiscount = computed({
    get() {
        return new Intl.NumberFormat('ru-RU').format(discountValue.value || 0);
    },
    set(val) {
        const num = Number(val.replace(/\D/g, ''));
        discountValue.value = num;
    }
});


const updateTrades = async (actionType = null) => {
    if (actionType == 'add') {
        addBtnDefault.value = false
        addBtnLoading.value = true
    } else if (actionType == 'rem') {
        remBtnDefault.value = false
        rembtnLoading.value = true
    }

    const orderId = item?.order_id || item?.Orders?.id || item?.Trades?.order_id;
    const tradeId = item?.id || item?.Trades?.id;
    store.loader = true
    store.ordersLoading = true
    const payload = {
        id: tradeId,
        order_id: orderId,
        quantity: Number(query.quantity),
        code: item?.Trades?.code || item?.code || "string",
        price: query.price,
        discount: calculatedDiscount.value
    }

    const res = await api.update_trade(payload).catch(err => {
        findError('signIn', err.response?.status)
    })
    store.loader = false
    store.ordersLoading = false

    addBtnDefault.value = true;
    remBtnDefault.value = true;
    addBtnLoading.value = false;
    rembtnLoading.value = false;
}

function discountPrice() {
    return (query.price * query.quantity) - calculatedDiscount.value;
}

const deleteTrade = async (tradeId) => {
    store.ordersLoading = true
    store.loader = true
    const res = await api.remove_trade(tradeId).catch(err => {
        findError('signIn', err.response?.status)
    })
    store.ordersLoading = false
    store.loader = false
    console.log(res)
}

function addQyt(add) {
    query.quantity += 1
    updateTrades(add)
}

function remQyt(rem) {
    if (query.quantity <= 1) return;
    query.quantity -= 1
    if (query.quantity >= 0) {
        updateTrades(rem)
    }
}

function allPrice() {
    let price = item?.Trades?.price * query.quantity
    return price
}

function changePrice() {
    updateTrades()
}

function discountFunc() {
    updateTrades()
}
</script>

<template>
    <tbody>
        <tr>
            <td>{{ index + 1 }}</td>

            <td @click="editNameAndCategory = true">
                {{ item?.Trades?.product?.product_type?.name2 }} - {{ item?.Trades?.product?.product_type?.name }}
            </td>

            <td>
                <div class="qty-control">
                    <button type="button" v-if="addBtnDefault" @click="remQyt('add')">−</button>
                    <button type="button" v-if="addBtnLoading">
                        <SpinerLoader :width="10" />
                    </button>
                    <input type="text" :value="query.quantity">
                    <button type="button" v-if="remBtnDefault" @click="addQyt('rem')">+</button>
                    <button type="button" v-if="rembtnLoading">
                        <SpinerLoader :width="10" />
                    </button>
                </div>
                <span class="qty-txt">{{ item?.Trades?.product?.olchov_birligi }}</span>
            </td>

            <td>
                <form @submit.prevent="changePrice()">
                    <input class="price-input" type="text" v-model="displayPrice"></input>
                    <span class="qty-txt">{{ item?.Trades?.product?.currency?.currency }}</span>
                </form>
            </td>

            <td>
                <form class="discount-form" @submit.prevent="discountFunc()">
                    <div v-if="saleSwitch" class="discount-wrapper" style="display: flex; gap: 5px;">
                        <input type="text" class="discount-input" placeholder="0" v-model="displayDiscount" />

                        <select class="order-sale-price-select" v-model="discountType" @change="discountFunc()">
                            <option value="sum">so'm</option>
                            <option value="percent">%</option>
                        </select>
                    </div>

                    <button type="button" @click="saleSwitch = !saleSwitch" class="open-sale-input-btn">
                        <i class="fa-solid fa-angle-right" :class="{ 'fa-angle-left': saleSwitch }"></i>
                    </button>
                </form>
            </td>

            <td>
                <div class="prs">
                    {{ formatUZS(discountPrice()) }} so'm
                    <div class="discount-price-wrp" v-if="item?.Trades?.discount > 0">
                        <span class="discount-price">{{ formatUZS(allPrice())
                            }}</span>
                        <span>so'm</span>
                    </div>
                </div>
            </td>
        </tr>
        <button class="remove-trade-btn" @click="deleteTrade(item?.Trades?.id)"><i
                class="fa-solid fa-trash"></i></button>
    </tbody>

    <productsModal v-model="editNameAndCategory">
        <header class="modal-header">
            <h2>{{ item?.Trades?.product?.product_type?.name2 }} - {{ item?.Trades?.product?.product_type?.name }}</h2>
            <button class="close-btn" @click="editNameAndCategory = false">&times;</button>
        </header>

        <div class="edit-body">
            <div class="ed-inp">
                <label for="pr-name">Ombordagi soni</label>
                <input id="pr-name" :value="item?.Trades?.quantity" type="text" readonly>
            </div>
            <div class="ed-inp">
                <label for="pr-category">Izohi</label>
                <input :value="item?.Trades?.code" type="text" id="pr-category" readonly>
            </div>
        </div>
    </productsModal>
</template>