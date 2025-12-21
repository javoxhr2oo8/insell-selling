<!-- <script setup>
import api from '~/server/api';
import { useStore } from '~/store/store';
import { useUtil } from '~/server/util';

const store = useStore();
const { findError, formatUZS } = useUtil();

const orderFormSection1 = ref(true)
const orderFormSection2 = ref(false)
const orderFormSection3 = ref(false)

const totalPrice = computed(() => store.ordersBlance?.[0]?.balance)

const userData = reactive({
    customer_name: "",
    customer_phone: 0,
    discount: 0,
    loan_repayment_date: "2025-12-21",
});

const confirmOrder = async () => {
    
    const payload = {
        order_id: store.orderId,
        customer_name: userData.customer_name,
        customer_phone: Number(userData.customer_phone),
        discount: userData.discount,
        loan_repayment_date: userData.loan_repayment_date,
        money: [
            {
                paid_money: store.ordersBlance?.[0]?.balance,
                currency_id: store.currencyId,
                kassa_id: store.kassaId
            }
        ],
        seller_id: store.sellerId || 0,
        service_id: 0,
        service_price: 0
    };

    if (!payload.order_id) {
        console.error("Ошибка: Order ID отсутствует. Возможно, нужно заново выбрать заказ.");
        return;
    }

    try {
        const res = await api.confirm_order(payload);
        console.log("Успешно подтверждено", res);
    } catch (error) {
        console.error("Ошибка API:", error.response?.data);
    }
}

const getBranchId = computed(() => store.branchId)
const getKassInfo = ref({})

const kassaData = reactive({
    branch_id: getBranchId
})

const getKassa = async () => {
    const res = await api.get_kassa(kassaData)
    getKassInfo.value = res
    store.currencyId = res[0]?.Kassa?.currency_id
    store.kassaId = res[0]?.Kassa?.id
    console.log(getKassInfo.value)
}

function orderFormSection1Func() {
    orderFormSection1.value = true
    orderFormSection2.value = false
    orderFormSection3.value = false
}

function orderFormSection2Func() {
    orderFormSection1.value = false
    orderFormSection2.value = true
    orderFormSection3.value = false
}

function orderFormSection3Func() {
    orderFormSection1.value = false
    orderFormSection2.value = false
    orderFormSection3.value = true
}


onMounted(() => {
    getKassa()
})
</script> -->

<!-- <template>
    <div>
        <ProductsModal v-model="store.modalProducts">
            <div class="modal">
                <header class="modal-header">
                    <h3>{{ formatUZS(store.ordersBlance?.[0]?.balance) }} so'm</h3>
                    <button class="close-btn" @click="store.modalProducts = false">&times;</button>
                </header>

                <div class="confirm-order-wrapper">
                    <div class="confirm-order-top-actions">
                        <button @click="orderFormSection1Func()"
                            :class="{ 'active-confirm-action': orderFormSection1 }">Umumiy</button>
                        <button @click="orderFormSection2Func()"
                            :class="{ 'active-confirm-action': orderFormSection2 }">Doimiy</button>
                        <button @click="orderFormSection3Func()"
                            :class="{ 'active-confirm-action': orderFormSection3 }">Yangi</button>
                    </div>

                    <form @submit.prevent="confirmOrder()">
                        <div class="order-confirm-form" v-if="orderFormSection1">
                            <div class="form-top-inputs">
                                <div class="form-t-inp">
                                    <label>To'lov summa</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model="totalPrice">
                                        <div class="select-option-wrp">
                                            <select>
                                                <option :value="1" v-for="kassa in getKassInfo">{{ kassa?.Kassa?.name +
                                                    '-' + kassa?.currency + '-' + kassa?.Kassa?.name }}</option>
                                            </select>
                                            <button type="button" @click="addPaymentField"><i
                                                    class="fas fa-plus"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp">
                                    <label>Chegirma</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model="userData.discount">
                                    </div>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp">
                                    <label>Hodim</label>
                                    <div class="form-top-input-wrp">
                                        <div class="select-option-wrp select-option-wrp-bottom">
                                            <select>
                                                <option :value="1">Sotuvchi</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="confirm confirm-form"><button type="submit">Tasdiqlash <img
                                        src="@/assets/images/svg/Done_all_round.svg"></button></div>
                        </div>

                        <div class="order-confirm-form" v-if="orderFormSection2">
                            <div class="client-select s-client" id="clients-select">
                                <label for="clients-select">Mijoz</label>
                                <select v-model="userData.customer_name">
                                    <option value="client">Mijoz 1</option>
                                    <option value="client">Mijoz 2</option>
                                </select>
                            </div>
                            <div class="form-top-inputs">
                                <div class="form-t-inp">
                                    <label>To'lov summa</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model="totalPrice">
                                        <div class="select-option-wrp">
                                            <select>
                                                <option :value="1" v-for="kassa in getKassInfo">{{ kassa?.Kassa?.name +
                                                    '-' + kassa?.currency + '-' + kassa?.Kassa?.name }}</option>
                                            </select>
                                            <button type="button" @click="addPaymentField"><i
                                                    class="fas fa-plus"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp">
                                    <label>Nasiya</label>
                                    <div class="form-top-input-wrp"><input type="number">
                                    </div>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp">
                                    <label>Hodim</label>
                                    <div class="form-top-input-wrp">
                                        <div class="select-option-wrp select-option-wrp-bottom">
                                            <select>
                                                <option :value="1">Sotuvchi</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="confirm confirm-form"><button type="submit">Tasdiqlash <img
                                        src="@/assets/images/svg/Done_all_round.svg"></button></div>
                        </div>

                        <div class="order-confirm-form" v-if="orderFormSection3">
                            <div class="form-top-inputs">
                                <div class="new-inp"><label>Ism</label><input type="text" v-model="userData.customer_name">
                                </div>
                                <div class="new-inp"><label>Telefon raqam</label><input type="number"
                                        placeholder="+998" v-model="userData.customer_phone"></div>
                            </div>
                            <div class="form-top-inputs">
                                <div class="form-t-inp">
                                    <label>To'lov summa</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model="totalPrice">
                                        <div class="select-option-wrp">
                                            <select>
                                                <option :value="1" v-for="kassa in getKassInfo">{{
                                                    kassa?.Kassa?.name + '-' + kassa?.currency + '-' +
                                                    kassa?.Kassa?.name }}</option>
                                            </select>
                                            <button type="button"><i class="fas fa-plus"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp">
                                    <label>Chegirma</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model="userData.discount">
                                    </div>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp">
                                    <label>Hodim</label>
                                    <div class="form-top-input-wrp">
                                        <div class="select-option-wrp select-option-wrp-bottom">
                                            <select>
                                                <option :value="1">Sotuvchi</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="confirm confirm-form"><button type="submit">Tasdiqlash <img
                                        src="@/assets/images/svg/Done_all_round.svg"></button></div>
                        </div>
                    </form>
                </div>
            </div>
        </ProductsModal>

        <div class="confirm">
            <button @click="store.modalProducts = true">
                Tasdiqlash
                <img src="@/assets/images/svg/Done_all_round.svg" alt="">
            </button>
        </div>
    </div>
</template> -->


<script setup>
import api from '~/server/api';
import { useStore } from '~/store/store';
import { useUtil } from '~/server/util';
import { ToastError, ToastSuccess } from '@/composables/toast';

const store = useStore();
const { findError, formatUZS } = useUtil();

const orderFormSection1 = ref(true)
const orderFormSection2 = ref(false)
const orderFormSection3 = ref(false)

const userData = reactive({
    customer_name: "",
    customer_phone: 0,
    discount: 0,
    loan_repayment_date: "2025-12-21",
    loan_comment: ""
});

const moneyFields = reactive([
    {
        paid_money: 0,
        currency_id: 0,
        kassa_id: 0
    }
]);

watch(() => store.modalProducts, (isOpen) => {
    if (isOpen && store.ordersBlance?.[0]?.balance) {
        moneyFields[0].paid_money = store.ordersBlance[0].balance;
        moneyFields.splice(1);
    }
});

const addPaymentField = () => {
    moneyFields.push({
        paid_money: 0,
        currency_id: store.currencyId || 0,
        kassa_id: store.kassaId || 0
    });
};

const removePaymentField = (index) => {
    moneyFields.splice(index, 1);
};

const confirmOrder = async () => {
    store.ordersLoading = true
    const payload = {
        order_id: Number(store.orderId),
        customer_name: userData.customer_name || "Mijoz",
        customer_phone: Number(userData.customer_phone),
        discount: Number(userData.discount),
        money: moneyFields.map(item => ({
            paid_money: Number(item.paid_money),
            currency_id: Number(item.currency_id),
            kassa_id: Number(item.kassa_id)
        })),
        loan_repayment_date: userData.loan_repayment_date,
        loan_comment: userData.loan_comment,
        seller_id: Number(store.sellerId || 0),
        service_id: 0,
        service_price: 0
    };

    try {
        const res = await api.confirm_order(payload);
        console.log("Успешно подтверждено", res);
        store.modalProducts = false;
        store.ordersLoading = false
        ToastSuccess('Order tastiqlandi')
    } catch (error) {
        console.error("Ошибка API:", error.response?.data);
        store.ordersLoading = false
        ToastError('Xatolik yuz berdi')
    }
}

const getKassInfo = ref([])
const getKassa = async () => {
    const res = await api.get_kassa({ branch_id: store.branchId })
    getKassInfo.value = res
    if (res.length > 0) {
        store.currencyId = res[0]?.Kassa?.currency_id
        store.kassaId = res[0]?.Kassa?.id
        moneyFields[0].currency_id = res[0]?.Kassa?.currency_id
        moneyFields[0].kassa_id = res[0]?.Kassa?.id
    }
}

const onKassaChange = (index) => {
    const selectedKassa = getKassInfo.value.find(k => k.Kassa.id === moneyFields[index].kassa_id);
    if (selectedKassa) {
        moneyFields[index].currency_id = selectedKassa.Kassa.currency_id;
    }
}

function orderFormSection1Func() { orderFormSection1.value = true; orderFormSection2.value = false; orderFormSection3.value = false; }
function orderFormSection2Func() { orderFormSection1.value = false; orderFormSection2.value = true; orderFormSection3.value = false; }
function orderFormSection3Func() { orderFormSection1.value = false; orderFormSection2.value = false; orderFormSection3.value = true; }

onMounted(() => { getKassa() })
</script>

<template>
    <div>
        <ProductsModal v-model="store.modalProducts">
            <div class="modal">
                <header class="modal-header">
                    <h3>{{ formatUZS(store.ordersBlance?.[0]?.balance) }} so'm</h3>
                    <button class="close-btn" @click="store.modalProducts = false">&times;</button>
                </header>

                <div class="confirm-order-wrapper">
                    <div class="confirm-order-top-actions">
                        <button @click="orderFormSection1Func()"
                            :class="{ 'active-confirm-action': orderFormSection1 }">Umumiy</button>
                        <button @click="orderFormSection2Func()"
                            :class="{ 'active-confirm-action': orderFormSection2 }">Doimiy</button>
                        <button @click="orderFormSection3Func()"
                            :class="{ 'active-confirm-action': orderFormSection3 }">Yangi</button>
                    </div>

                    <form @submit.prevent="confirmOrder()">
                        <div class="order-confirm-form" v-if="orderFormSection1">
                            <div class="form-top-inputs" v-for="(field, index) in moneyFields" :key="'s1' + index">
                                <div class="form-t-inp">
                                    <label v-if="index === 0">To'lov summa</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model="field.paid_money">
                                        <div class="select-option-wrp">
                                            <select v-model="field.kassa_id" @change="onKassaChange(index)">
                                                <option v-for="kassa in getKassInfo" :key="kassa.Kassa.id"
                                                    :value="kassa.Kassa.id">
                                                    {{ kassa?.Kassa?.name + '-' + kassa?.currency + '-' +
                                                        kassa?.Kassa?.name }}
                                                </option>
                                            </select>
                                            <button type="button"
                                                @click="index === 0 ? addPaymentField() : removePaymentField(index)">
                                                <i :class="index === 0 ? 'fas fa-plus' : 'fas fa-minus'"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp"><label>Chegirma</label>
                                    <div class="form-top-input-wrp"><input type="number" v-model="userData.discount">
                                    </div>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp"><label>Hodim</label>
                                    <div class="form-top-input-wrp">
                                        <div class="select-option-wrp select-option-wrp-bottom"><select>
                                                <option :value="1">Sotuvchi</option>
                                            </select></div>
                                    </div>
                                </div>
                            </div>
                            <div class="confirm confirm-form"><button type="submit">Tasdiqlash <img
                                        src="@/assets/images/svg/Done_all_round.svg"></button></div>
                        </div>

                        <div class="order-confirm-form" v-if="orderFormSection2">
                            <div class="client-select s-client" id="clients-select">
                                <label for="clients-select">Mijoz</label>
                                <select v-model="userData.customer_name">
                                    <option value="client1">Mijoz 1</option>
                                    <option value="client2">Mijoz 2</option>
                                </select>
                            </div>
                            <div class="form-top-inputs" v-for="(field, index) in moneyFields" :key="'s2' + index">
                                <div class="form-t-inp">
                                    <label v-if="index === 0">To'lov summa</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model="field.paid_money">
                                        <div class="select-option-wrp">
                                            <select v-model="field.kassa_id" @change="onKassaChange(index)">
                                                <option v-for="kassa in getKassInfo" :key="kassa.Kassa.id"
                                                    :value="kassa.Kassa.id">
                                                    {{ kassa?.Kassa?.name + '-' + kassa?.currency + '-' +
                                                        kassa?.Kassa?.name }}
                                                </option>
                                            </select>
                                            <button type="button"
                                                @click="index === 0 ? addPaymentField() : removePaymentField(index)">
                                                <i :class="index === 0 ? 'fas fa-plus' : 'fas fa-minus'"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp"><label>Nasiya</label>
                                    <div class="form-top-input-wrp"><input type="number"></div>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp"><label>Hodim</label>
                                    <div class="form-top-input-wrp">
                                        <div class="select-option-wrp select-option-wrp-bottom"><select>
                                                <option :value="1">Sotuvchi</option>
                                            </select></div>
                                    </div>
                                </div>
                            </div>
                            <div class="confirm confirm-form"><button type="submit">Tasdiqlash <img
                                        src="@/assets/images/svg/Done_all_round.svg"></button></div>
                        </div>

                        <div class="order-confirm-form" v-if="orderFormSection3">
                            <div class="form-top-inputs">
                                <div class="new-inp"><label>Ism</label><input type="text"
                                        v-model="userData.customer_name"></div>
                                <div class="new-inp"><label>Telefon raqam</label><input type="number" placeholder="+998"
                                        v-model="userData.customer_phone"></div>
                            </div>
                            <div class="form-top-inputs" v-for="(field, index) in moneyFields" :key="'s3' + index">
                                <div class="form-t-inp">
                                    <label v-if="index === 0">To'lov summa</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model="field.paid_money">
                                        <div class="select-option-wrp">
                                            <select v-model="field.kassa_id" @change="onKassaChange(index)">
                                                <option v-for="kassa in getKassInfo" :key="kassa.Kassa.id"
                                                    :value="kassa.Kassa.id">
                                                    {{ kassa?.Kassa?.name + '-' + kassa?.currency + '-' +
                                                        kassa?.Kassa?.name }}
                                                </option>
                                            </select>
                                            <button type="button"
                                                @click="index === 0 ? addPaymentField() : removePaymentField(index)">
                                                <i :class="index === 0 ? 'fas fa-plus' : 'fas fa-minus'"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp"><label>Chegirma</label>
                                    <div class="form-top-input-wrp"><input type="number" v-model="userData.discount">
                                    </div>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp"><label>Hodim</label>
                                    <div class="form-top-input-wrp">
                                        <div class="select-option-wrp select-option-wrp-bottom"><select>
                                                <option :value="1">Sotuvchi</option>
                                            </select></div>
                                    </div>
                                </div>
                            </div>
                            <div class="confirm confirm-form"><button type="submit">Tasdiqlash <img
                                        src="@/assets/images/svg/Done_all_round.svg"></button></div>
                        </div>
                    </form>
                </div>
            </div>
        </ProductsModal>

        <div class="confirm">
            <button @click="store.modalProducts = true">Tasdiqlash <img
                    src="@/assets/images/svg/Done_all_round.svg"></button>
        </div>
    </div>
</template>