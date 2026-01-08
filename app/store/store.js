import { defineStore } from "pinia";

export const useStore = defineStore('myStore', () => {
    const modalProducts = ref(false)
    const modalProductsCategory = ref(false)
    const productDetailShow = ref(false)
    const confirPhoneNumber = ref()
    const loader = ref(false)
    const token = ref("")
    const userInfo = ref({})
    const orderId = ref(4528)
    const branchId = ref(16)
    const ordersBlance = ref()
    const orderCode = ref("")
    const ordersLoading = ref(false)
    const sellerId = ref()
    const customerName = ref("")
    const customerPhone = ref()
    const currencyId = ref()
    const kassaId = ref()
    const ordinalNumber = ref()
    const tradesId = ref("")
    const updateOrders = ref(false)
    const totalPriceOffline = ref()
    const offlineOrdersList = []
    const updateTrade = ref(false)
    const updateRegularProducts = ref(false)
    return { 
        modalProducts,
        productDetailShow,
        loader,
        confirPhoneNumber,
        token,
        userInfo,
        orderId,
        branchId,
        ordersBlance,
        orderCode,
        ordersLoading,
        sellerId,
        customerName,
        customerPhone,
        currencyId,
        kassaId,
        ordinalNumber,
        tradesId,
        updateOrders,
        totalPriceOffline,
        offlineOrdersList,
        updateTrade,
        updateRegularProducts
     }
})