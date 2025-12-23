<script setup>
import { useUtil } from '~/server/util';
import { useStore } from '~/store/store';
import api from '~/server/api';

const { item } = defineProps(['item', 'index'])
const saleSwitch = ref(false)
const store = useStore()

const { formatUZS, findError } = useUtil()

const price = ref(item?.Trades?.price)
const discount = ref(item?.Trades?.discount)

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
        return new Intl.NumberFormat('ru-RU').format(discount.value || 0);
    },
    set(val) {
        const num = Number(val.replace(/\D/g, ''));
        discount.value = num;
    }
});

const updateTrades = async () => {
    const orderId = item?.order_id || item?.Orders?.id || item?.Trades?.order_id;
    const tradeId = item?.id || item?.Trades?.id;
    store.loader = true

    const payload = {
        id: tradeId,
        order_id: orderId,
        quantity: Number(query.quantity),
        code: item?.Trades?.code || item?.code || "string",
        price: query.price,
        discount: query.discount
    }

    const res = await api.update_trade(payload).catch(err => {
        findError('signIn', err.response?.status)
    })
    store.loader = false
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

function addQyt() {
    query.quantity += 1
    updateTrades()
}

function remQyt() {
    if (query.quantity <= 1) return;
    query.quantity -= 1
    if (query.quantity >= 0) {
        updateTrades()
    }
}

function allPrice() {
    let price = item?.Trades?.price * query.quantity
    return price
}

function discountPrice() {
    let price = item?.Trades?.price * query.quantity - query.discount
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

            <td>
                {{ item?.Trades?.product?.product_type?.name }}
            </td>

            <td>
                <div class="qty-control">
                    <button type="button" @click="remQyt()">−</button>
                    <input type="text" :value="query.quantity">
                    <button type="button" @click="addQyt()">+</button>
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
                <form @submit.prevent="discountFunc()">
                    <input type="text" class="discount-input" placeholder="0" min="0" v-if="saleSwitch"
                        v-model="displayDiscount" />
                    <select class="order-sale-price-select" v-if="saleSwitch">
                        <option value="so'm">so'm</option>
                        <option value="%">%</option>
                    </select>
                    <button type="button" @click="saleSwitch = !saleSwitch" class="open-sale-input-btn"><i
                            class="fa-solid fa-angle-right" :class="{ 'fa-angle-left': saleSwitch }"></i></button>
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
</template>