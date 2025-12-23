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

const getCustomersData = ref({})

const getCustomers = async () => {
    const query = {
        search: "",
        branch_id: store.branchId,
        page: 0,
        limit: 25
    }
    const res = await api.get_customers(query)
    getCustomersData.value = res.data
}

const userData = reactive({
    customer_name: "",
    customer_phone: 0,
    discount: 0,
    loan_repayment_date: "2025-12-21",
    loan_comment: ""
});

const nasiya = ref(0);
const showNasiyaDate = ref(false);


const moneyFields = reactive([
    {
        paid_money: 0,
        order_money: 0,
        currency_id: 0,
        kassa_id: 0
    }
]);

const totalOrderAmount = computed(() => {
    return store.ordersBlance?.[0]?.balance || 0;
});


const amountToPay = computed(() => {
    const total = totalOrderAmount.value;
    return total - nasiya.value - userData.discount;
});


const handleNasiyaChange = () => {
    showNasiyaDate.value = nasiya.value > 0;

    if (nasiya.value > totalOrderAmount.value) {
        nasiya.value = totalOrderAmount.value;
    }

    if (moneyFields.length > 0) {
        moneyFields[0].order_money = Math.max(0, amountToPay.value);
    }
};

watch(() => store.modalProducts, (isOpen) => {
    if (isOpen && store.ordersBlance?.[0]?.balance) {
        nasiya.value = 0;
        showNasiyaDate.value = false;
        userData.discount = 0;

        const balance = store.ordersBlance[0].balance;
        moneyFields[0].paid_money = balance;
        moneyFields[0].order_money = balance;
        moneyFields.splice(1);
    }
});

const addPaymentField = () => {
    const lastField = moneyFields[moneyFields.length - 1];

    if (lastField.paid_money > 0) {
        moneyFields.push({
            paid_money: 0,
            order_money: 0,
            currency_id: store.currencyId || 0,
            kassa_id: store.kassaId || 0
        });

        distributePayments();
    }
};

const distributePayments = () => {
    const remainingAmount = amountToPay.value;
    const fieldCount = moneyFields.length;

    if (fieldCount === 1) {
        moneyFields[0].order_money = remainingAmount;
        moneyFields[0].paid_money = remainingAmount + nasiya.value;
    } else {
        const amountPerField = Math.floor(remainingAmount / fieldCount);

        moneyFields.forEach((field, index) => {
            if (index === fieldCount - 1) {
                const previousSum = moneyFields
                    .slice(0, index)
                    .reduce((sum, f) => sum + (f.order_money || 0), 0);
                field.order_money = remainingAmount - previousSum;
            } else {
                field.order_money = amountPerField;
            }

            if (index === 0) {
                field.paid_money = field.order_money + nasiya.value;
            } else {
                field.paid_money = field.order_money;
            }
        });
    }
};

const removePaymentField = (index) => {
    if (moneyFields.length > 1) {
        // Перераспределяем сумму удаляемого поля на оставшиеся
        const removedOrderMoney = moneyFields[index].order_money;
        moneyFields.splice(index, 1);

        // Добавляем удаленную сумму к первому полю
        if (moneyFields.length > 0) {
            moneyFields[0].order_money += removedOrderMoney;
            moneyFields[0].paid_money = moneyFields[0].order_money + nasiya.value;
        }
    }
};

const confirmOrder = async () => {
    store.ordersLoading = true;

    // Проверяем и распределяем суммы перед отправкой
    distributePayments();

    const payload = {
        order_id: Number(store.orderId),
        customer_name: userData.customer_name || "Mijoz",
        customer_phone: Number(userData.customer_phone),
        discount: Number(userData.discount),
        nasiya: Number(nasiya.value),
        money: moneyFields.map(item => ({
            paid_money: Number(item.paid_money),
            order_money: Number(item.order_money),
            currency_id: Number(item.currency_id),
            kassa_id: Number(item.kassa_id)
        })),
        loan_repayment_date: nasiya.value > 0 ? userData.loan_repayment_date : null,
        loan_comment: userData.loan_comment,
        seller_id: Number(store.sellerId || 0),
        service_id: 0,
        service_price: 0
    };

    try {
        const res = await api.confirm_order(payload);
        console.log("Успешно подтверждено", res);
        store.modalProducts = false;
        store.ordersLoading = false;
        ToastSuccess('Order tastiqlandi');
    } catch (error) {
        console.error("Ошибка API:", error.response?.data);
        store.ordersLoading = false;
        ToastError('Xatolik yuz berdi');
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

watch([nasiya, () => userData.discount], () => {
    distributePayments();
}, { immediate: true });

function orderFormSection1Func() {
    orderFormSection1.value = true;
    orderFormSection2.value = false;
    orderFormSection3.value = false;
}
function orderFormSection2Func() {
    orderFormSection1.value = false;
    orderFormSection2.value = true;
    orderFormSection3.value = false;
}
function orderFormSection3Func() {
    orderFormSection1.value = false;
    orderFormSection2.value = false;
    orderFormSection3.value = true;
}

onMounted(() => { getKassa() })
</script>

<template>
    <div>
        <ProductsModal v-model="store.modalProducts">
            <div class="modal">
                <header class="modal-header">
                    <h3>{{ formatUZS(totalOrderAmount) }} so'm</h3>
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
                                        <input type="number" v-model="field.paid_money" readonly>
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
                                    <small v-if="index === 0" style="color: #666; font-size: 12px;">
                                        (Order: {{ formatUZS(field.order_money) }}, Nasiya: {{ formatUZS(nasiya) }})
                                    </small>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp"><label>Chegirma</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model="userData.discount" @input="distributePayments">
                                    </div>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp"><label>Nasiya</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model="nasiya" @input="handleNasiyaChange">
                                    </div>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp" v-if="showNasiyaDate">
                                <div class="form-t-inp"><label>Nasiya muddati</label>
                                    <div class="form-top-input-wrp">
                                        <input type="date" v-model="userData.loan_repayment_date">
                                    </div>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp"><label>Hodim</label>
                                    <div class="form-top-input-wrp">
                                        <div class="select-option-wrp select-option-wrp-bottom">
                                            <select>
                                                <option :value="1">Sotuvchi</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="confirm confirm-form">
                                <button type="submit">Tasdiqlash <img
                                        src="@/assets/images/svg/Done_all_round.svg"></button>
                            </div>
                        </div>

                        <div class="order-confirm-form" v-if="orderFormSection2">
                            <div class="client-select s-client" id="clients-select">
                                <label for="clients-select">Mijoz</label>
                                <select v-model="userData.customer_name" @focus="getCustomers()">
                                    <option v-for="clinet in getCustomersData" :value="clinet.name">
                                        {{ clinet.name }} - {{ clinet.phone }}
                                    </option>
                                </select>
                            </div>
                            <div class="form-top-inputs" v-for="(field, index) in moneyFields" :key="'s2' + index">
                                <div class="form-t-inp">
                                    <label v-if="index === 0">To'lov summa</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model="field.paid_money" readonly>
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
                                    <small v-if="index === 0" style="color: #666; font-size: 12px;">
                                        (Order: {{ formatUZS(field.order_money) }}, Nasiya: {{ formatUZS(nasiya) }})
                                    </small>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp"><label>Chegirma</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model="userData.discount" @input="distributePayments">
                                    </div>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp"><label>Nasiya</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model="nasiya" @input="handleNasiyaChange">
                                    </div>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp" v-if="showNasiyaDate">
                                <div class="form-t-inp"><label>Nasiya muddati</label>
                                    <div class="form-top-input-wrp">
                                        <input type="date" v-model="userData.loan_repayment_date">
                                    </div>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp"><label>Hodim</label>
                                    <div class="form-top-input-wrp">
                                        <div class="select-option-wrp select-option-wrp-bottom">
                                            <select>
                                                <option :value="1">Sotuvchi</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="confirm confirm-form">
                                <button type="submit">Tasdiqlash <img
                                        src="@/assets/images/svg/Done_all_round.svg"></button>
                            </div>
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
                                        <input type="number" v-model="field.paid_money" readonly>
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
                                    <small v-if="index === 0" style="color: #666; font-size: 12px;">
                                        (Order: {{ formatUZS(field.order_money) }}, Nasiya: {{ formatUZS(nasiya) }})
                                    </small>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp"><label>Chegirma</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model="userData.discount" @input="distributePayments">
                                    </div>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp"><label>Nasiya</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model="nasiya" @input="handleNasiyaChange">
                                    </div>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp" v-if="showNasiyaDate">
                                <div class="form-t-inp"><label>Nasiya muddati</label>
                                    <div class="form-top-input-wrp">
                                        <input type="date" v-model="userData.loan_repayment_date">
                                    </div>
                                </div>
                            </div>
                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp"><label>Hodim</label>
                                    <div class="form-top-input-wrp">
                                        <div class="select-option-wrp select-option-wrp-bottom">
                                            <select>
                                                <option :value="1">Sotuvchi</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="confirm confirm-form">
                                <button type="submit">Tasdiqlash <img
                                        src="@/assets/images/svg/Done_all_round.svg"></button>
                            </div>
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