<script setup>
import api from '~/server/api';
import { useStore } from '~/store/store';
import { useUtil } from '~/server/util';
import { ToastError, ToastSuccess } from '@/composables/toast';
import { ref, reactive, watch, nextTick } from 'vue';

const store = useStore();
const { formatUZS } = useUtil();

const orderFormSection1 = ref(true);
const orderFormSection2 = ref(false);
const orderFormSection3 = ref(false);

const getCustomersData = ref({});

const userData = reactive({
    customer_name: '',
    customer_phone: 0,
    discount: 0,
    loan_repayment_date: '2025-12-21',
    loan_comment: ''
});

const nasiya = ref(0);
const showNasiyaDate = ref(false);
const client = ref({})

const current_discount = ref(0);

const total_price = ref(0);
const balance = ref(0);
const balansePrice = ref(0);

const moneyFields = reactive([
    {
        paid_money: 0,
        currency_id: 0,
        kassa_id: 0,
        kassa: null
    }
]);

const getCustomers = async () => {
    const query = { search: '', branch_id: store.branchId, page: 0, limit: 25 };
    const res = await api.get_customers(query);
    getCustomersData.value = res.data;
};

const getKassInfo = ref([]);
const getKassa = async () => {
    const res = await api.get_kassa({ branch_id: store.branchId });
    getKassInfo.value = res;

    if (res.length > 0) {
        moneyFields.forEach((field, index) => {
            const savedKassa = JSON.parse(localStorage.getItem(`cashier${index}`) || 'null');
            if (savedKassa) {
                field.kassa = savedKassa;
                field.currency_id = savedKassa.currency_id;
                field.kassa_id = savedKassa.id;
            } else {
                field.kassa = res[0]?.Kassa;
                field.currency_id = res[0]?.Kassa?.currency_id;
                field.kassa_id = res[0]?.Kassa?.id;
                localStorage.setItem(`cashier${index}`, JSON.stringify(res[0]?.Kassa));
            }
        });
        recalcPayments();
    }
};

watch(() => store.modalProducts, (open) => {
    if (!open) return;
    const orderBalance = store.ordersBlance?.[0]?.balance || 0;

    total_price.value = orderBalance;
    balance.value = orderBalance;
    balansePrice.value = orderBalance;

    userData.discount = 0;
    current_discount.value = 0;
    nasiya.value = 0;
    showNasiyaDate.value = false;

    moneyFields.splice(1);
    moneyFields[0].paid_money = orderBalance;

    getKassa();
});

const recalcPayments = () => {
    let rest = balance.value - Number(userData.discount || 0);

    moneyFields.forEach((field, index) => {
        if (index === 0) return;
        let paid = Number(field.paid_money || 0);
        if (field.kassa?.currency?.price) paid *= field.kassa.currency.price;
        rest -= paid;
    });

    if (rest < 0) rest = 0;

    const first = moneyFields[0];
    if (first.kassa?.currency?.price) {
        first.paid_money = rest / first.kassa.currency.price;
    } else {
        first.paid_money = rest;
    }

    balansePrice.value = rest;
};

const warningFunc = () => {
    if (userData.discount > balance.value) {
        ToastError("Chegirma summasi balansdan katta bo'lishi mumkin emas!");
        userData.discount = balance.value;
    }
    recalcPayments();
};

const onKassaChange = (index) => {
    const found = getKassInfo.value.find(k => k.Kassa.id === moneyFields[index].kassa_id);
    if (found) {
        moneyFields[index].kassa = found.Kassa;
        moneyFields[index].currency_id = found.Kassa.currency_id;
        recalcPayments();
    }
};

const addPaymentField = async () => {
    moneyFields.push({
        paid_money: 0,
        currency_id: moneyFields[0].currency_id,
        kassa_id: moneyFields[0].kassa_id,
        kassa: moneyFields[0].kassa
    });
    await nextTick();
    recalcPayments();
};

const removePaymentField = async (index) => {
    if (moneyFields.length > 1) {
        moneyFields.splice(index, 1);
        await nextTick();
        recalcPayments();
    }
};

const handleNasiyaChange = () => {
    showNasiyaDate.value = nasiya.value > 0;
    recalcPayments();
};

const confirmOrder = async () => {
    warningFunc();
        store.ordersLoading = true
        store.loader = true
    const totalPaid = moneyFields.reduce((s, f) => {
        let v = Number(f.paid_money || 0);
        if (f.kassa?.currency?.price) v *= f.kassa.currency.price;
        return s + v;
    }, 0);

    const requiredAmount = total_price.value - Number(userData.discount || 0);
    if (totalPaid < requiredAmount) {
        ToastError("Недостаточная сумма оплаты");
        return;
    }

    const payload = {
        order_id: Number(store.orderId),
        customer_name: client.value.name || userData.customer_name || "",
        customer_phone:  Number(client.value.phone || userData.customer_phone || 0),
        discount: Number(userData.discount),
        money: moneyFields.map(f => ({
            paid_money: Number(f.paid_money),
            currency_id: Number(f.currency_id),
            kassa_id: Number(f.kassa_id)
        })),
        loan_repayment_date: nasiya.value > 0 ? userData.loan_repayment_date : null,
        loan_comment: userData.loan_comment,
        seller_id: Number(store.sellerId || 0),
        service_id: 0,
        service_price: 0
    };

    try {
        await api.confirm_order(payload);
        ToastSuccess("Order tasdiqlandi");
        store.modalProducts = false;
        store.ordersLoading = false
        store.loader = false
    } catch (err) {
        console.error(err.response?.data);
        ToastError("Xatolik yuz berdi");
    }
};

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

watch(moneyFields, recalcPayments, { deep: true });
</script>

<template>
    <div>
        <ProductsModal v-model="store.modalProducts">
            <div class="modal">
                <header class="modal-header">
                    <div class="orders-price">
                        <span>
                            <strong class="text-danger text-decoration-line-through" v-if="!balance == total_price">
                                {{ formatUZS(total_price) }} so'm
                            </strong>
                            <strong class="varib-balance" style="color: var(--p-black)">
                                {{ formatUZS(balance) }} so'm
                            </strong>
                        </span>
                        <div>
                            <strong>{{ formatUZS(balansePrice) }} so'm</strong>
                        </div>
                    </div>
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
                        <div v-if="orderFormSection1">
                            <div v-for="(field, index) in moneyFields" :key="'s1' + index" class="form-top-inputs">
                                <div class="form-t-inp">
                                    <label v-if="index === 0">To'lov summa</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model.number="field.paid_money"
                                            @input="recalcPayments" />
                                        <div class="select-option-wrp">
                                            <select v-model="field.kassa_id" @change="onKassaChange(index)">
                                                <option v-for="kassa in getKassInfo" :key="kassa.Kassa.id"
                                                    :value="kassa.Kassa.id">
                                                    {{ `${kassa.Kassa.name} - ${kassa.currency} - ${kassa?.Kassa?.type}`
                                                    }}
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
                                <div class="form-t-inp">
                                    <label>Chegirma</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model="userData.discount" @input="warningFunc()" />
                                        <div class="input-group-text">so'm</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="orderFormSection2">
                            <div class="client-select">
                                <label>Mijoz</label>
                                <select v-model="client" @focus="getCustomers()">
                                    <option v-for="client in getCustomersData" :key="client.id" :value="client">
                                        {{ client.name }} - {{ client.phone }}
                                    </option>
                                </select>
                            </div>

                            <div v-for="(field, index) in moneyFields" :key="'s1' + index" class="form-top-inputs">
                                <div class="form-t-inp">
                                    <label v-if="index === 0">To'lov summa</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model.number="field.paid_money"
                                            @input="recalcPayments" />
                                        <div class="select-option-wrp">
                                            <select v-model="field.kassa_id" @change="onKassaChange(index)">
                                                <option v-for="kassa in getKassInfo" :key="kassa.Kassa.id"
                                                    :value="kassa.Kassa.id">
                                                    {{ `${kassa.Kassa.name} - ${kassa.currency} - ${kassa?.Kassa?.type}`
                                                    }}
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
                                <div class="form-t-inp">
                                    <label>Chegirma</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model="userData.discount" @input="warningFunc()" />
                                        <div class="input-group-text">so'm</div>
                                    </div>
                                </div>
                            </div>

                            <div class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp">
                                    <label>Nasiya</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model="nasiya" @input="handleNasiyaChange" />
                                    </div>
                                </div>
                            </div>

                            <div v-if="showNasiyaDate" class="form-top-inputs confirm-o-center-inp">
                                <div class="form-t-inp">
                                    <label>Nasiya muddati</label>
                                    <div class="form-top-input-wrp">
                                        <input type="date" v-model="userData.loan_repayment_date" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="orderFormSection3">
                            <div class="form-top-inputs">
                                <div class="new-inp"><label>Ism</label><input type="text"
                                        v-model="userData.customer_name" /></div>
                                <div class="new-inp"><label>Telefon raqam</label><input type="number"
                                        v-model="userData.customer_phone" /></div>
                            </div>

                            <div v-for="(field, index) in moneyFields" :key="'s3' + index" class="form-top-inputs">
                                <div class="form-t-inp">
                                    <label v-if="index === 0">To'lov summa</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model.number="field.paid_money"
                                            @input="recalcPayments" />
                                        <div class="select-option-wrp">
                                            <select v-model="field.kassa_id" @change="onKassaChange(index)">
                                                <option v-for="kassa in getKassInfo" :key="kassa.Kassa.id"
                                                    :value="kassa.Kassa.id">
                                                    {{ `${kassa.Kassa.name} - ${kassa.currency} - ${kassa?.Kassa?.type}`
                                                    }}
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
                                <div class="form-t-inp">
                                    <label>Chegirma</label>
                                    <div class="form-top-input-wrp">
                                        <input type="number" v-model="userData.discount" @input="warningFunc()" />
                                        <div class="input-group-text">so'm</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="confirm confirm-form">
                            <button type="submit">Tasdiqlash</button>
                        </div>
                    </form>
                </div>
            </div>
        </ProductsModal>

        <div class="confirm">
            <button @click="store.modalProducts = true">Tasdiqlash</button>
        </div>
    </div>
</template>