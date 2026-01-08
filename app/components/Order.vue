<script setup>
import { ref, reactive, computed } from 'vue'
import { useStore } from '~/store/store'
import { useUtil } from '~/server/util'
import { db } from '~/server/db'
import { useKey } from '@/composables/useKey'
import DeleteAlertModal from './AlertModal/DeleteAlertModal.vue';

const { item, index, total, trades, setTrades } = defineProps(['item', 'index', 'total', 'trades', 'setTrades'])
const store = useStore()
const { formatUZS } = useUtil()

const editNameAndCategory = ref(false)

const query = reactive({
    quantity: Math.max(item?.quantity || 1, 1),
    price: item?.price || 0,
    discount: item?.discount || 0
})

const addBtnDefault = ref(true)
const remBtnDefault = ref(true)
const addBtnLoading = ref(false)
const rembtnLoading = ref(false)

const deleteModalSwicth = ref(false)

const discountPrice = computed(() => (query.price * query.quantity) - query.discount)

const allPrice = computed(() => {
    const qty = Math.max(Number(query.quantity) || 1, 1)
    const price = Number(query.price) || 0
    return qty * price
})


function checkInputValue() {
    const input = document.querySelector(`#quantity-input${index}`)
    let rawValue = input.value
    let value = Number(rawValue)

    if (isNaN(value) || value < 1) {
        value = 0
    }

    input.value = value
    query.quantity = value
}


async function addQyt() {
    const input = document.querySelector(`#quantity-input${index}`)
    let val = Number(input.value) || 1

    val += 1
    input.value = val
    query.quantity = val

    await updateOfflineTrade()
}

async function remQyt() {
    if (query.quantity <= 1) return
    const input = document.querySelector(`#quantity-input${index}`)
    let val = Number(input.value) || 1

    val -= 1
    input.value = val
    query.quantity = val
    await updateOfflineTrade()
}

const updateOfflineTrade = async () => {
    if (!store.orderId) return
    checkInputValue()
    const data = await db.offlineTrades.get(store.orderId)
    if (!data) return

    const updatedTrades = data.trades.map(t =>
        t.id === item.id
            ? { ...t, quantity: query.quantity, price: query.price, discount: query.discount }
            : t
    )

    await db.offlineTrades.put({
        id: store.orderId,
        trades: updatedTrades,
        updatedAt: new Date().toISOString()
    })

    if (setTrades) setTrades(updatedTrades)
}

async function deleteOfflineTrade(tradeId) {
    store.ordersLoading = true
    if (!store.orderId) return
    const data = await db.offlineTrades.get(store.orderId)
    if (!data) return

    const updatedTrades = data.trades.filter(t => t.id !== tradeId)
    await db.offlineTrades.put({
        id: store.orderId,
        trades: updatedTrades,
        updatedAt: new Date().toISOString()
    })

    if (setTrades) setTrades(updatedTrades)
    store.ordersLoading = false
    deleteModalSwicth.value = false
}

const calculateCurrency = (currency) => {
    const usdToUzs = 12000
    let getPrice
    if (currency == '$') {
        getPrice = allPrice.value * usdToUzs
    } else {
        getPrice = allPrice.value
    }
    return getPrice
}

const displayPrice = computed({
    get() {
        return new Intl.NumberFormat('ru-RU').format(query.price || 0)
    },
    set(val) {
        const num = Number(val.replace(/\D/g, '')) || 0
        query.price = num
        updateOfflineTrade()
    }
})


useKey((eventData) => {
  if (!deleteModalSwicth.value) return
  
  if (eventData.key === 'Enter') {
    eventData.prevent()
    deleteOfflineTrade(item.id)
    deleteModalSwicth.value = false
  }
  
  if (eventData.key === 'Escape') {
    eventData.prevent()
    deleteModalSwicth.value = false
  }
})
</script>

<template>
    <tbody>
        <tr>
            <td>{{ total - index }}</td>

            <td @click="editNameAndCategory = true">
                {{ item?.Products?.category?.name }} - {{ item?.Products?.product_type?.name }}
            </td>

            <td>
                <div class="qty-control">
                    <button type="button" v-if="addBtnDefault" @click="remQyt">−</button>
                    <button type="button" v-if="addBtnLoading">...</button>
                    <input :id="`quantity-input${index}`" type="text" v-model.number="query.quantity"
                        @input="updateOfflineTrade" min="1">
                    <button type="button" v-if="remBtnDefault" @click="addQyt">+</button>
                    <button type="button" v-if="rembtnLoading">...</button>
                </div>
                <span class="qty-txt">{{ item?.Products?.olchov_birligi }}</span>
            </td>

            <td>
                <input class="price-input" type="text" v-model="displayPrice" inputmode="numeric">
                <span class="qty-txt">{{ item?.Products?.currency?.currency }}</span>
            </td>

            <td>
                <div class="prs">
                    {{ formatUZS(calculateCurrency(item?.Products?.currency?.currency)) }} so'm
                    <div class="discount-price-wrp" v-if="query.discount > 0">
                        <span class="discount-price">{{ formatUZS(allPrice) }}</span>
                        <span>so'm</span>
                    </div>
                </div>
            </td>


            <button class="remove-trade-btn" @click="deleteModalSwicth = true">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </tr>

        <DeleteAlertModal v-model:isOpen="deleteModalSwicth">
            <template #body>
                <div class="delete-content">
                    <span>Mahsulot {{ item?.Products?.product_type?.name }}</span>
                    <p class="final-warning">
                        Rostdan ham o'chirilsinmi?
                    </p>
                </div>
            </template>

            <template #footer>
                <div class="custom-footer">
                    <button class="btn-custom-cancel" @click="deleteModalSwicth = false">
                        Yo’q, ortga qaytish
                    </button>
                    <button class="btn-custom-delete" @click="deleteOfflineTrade(item.id)">
                        Ha, o’chirilsin
                    </button>
                </div>
            </template>
        </DeleteAlertModal>

        <productsModal v-model="editNameAndCategory">
            <header class="modal-header">
                <h2>{{ item?.product?.name2 }} - {{ item?.product?.name }}</h2>
                <button class="close-btn" @click="editNameAndCategory = false">&times;</button>
            </header>

            <div class="edit-body">
                <div class="ed-inp">
                    <label for="pr-name">Ombordagi soni</label>
                    <input id="pr-name" :value="query.quantity" type="text" readonly>
                </div>
                <div class="ed-inp">
                    <label for="pr-category">Izohi</label>
                    <input :value="item?.code" type="text" id="pr-category" readonly>
                </div>
            </div>
        </productsModal>
    </tbody>
</template>