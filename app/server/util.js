import { db } from "./db";
import { useStore } from "~/store/store";

export const useUtil = () => {
    const formatPhone = (val) => {
        const num = val.replace(/\D/g, '').substring(0, 9);
        if (!num) return '';
        if (num.length <= 2) return `(${num}`;
        if (num.length <= 5) return `(${num.slice(0, 2)}) ${num.slice(2)}`;
        if (num.length <= 7) return `(${num.slice(0, 2)}) ${num.slice(2, 5)}-${num.slice(5)}`;
        return `(${num.slice(0, 2)}) ${num.slice(2, 5)}-${num.slice(5, 7)}-${num.slice(7, 9)}`;
    };

    const router = useRouter()
    const store = useStore()

    const routerState = (page) => {
        router.push(`/${page}`)
    }

    const findError = (routerLink, status) => {
        if (status === 401) {
            routerState(routerLink)
        } else {
            routerState('')
        }
    }

    const formatUZS = (amount) => {
        if (!amount && amount !== 0) return '0';

        return new Intl.NumberFormat('ru-RU', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    }

    function formatPhoneUZ(phone) {
        if (!phone) return '';

        let digits = phone.toString().replace(/\D/g, '');

        if (digits.length === 9) {
            digits = '998' + digits;
        }
        if (!digits.startsWith('998')) {
            return '+' + digits;
        }

        return `+998 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
    }

    const focusInput = (id) => {
        const input = document.getElementById(id)
        input?.focus()
    }

    const saveRegularProduct = async (incomingProduct) => {
        try {
            store.updateRegularProducts = true
            const rawData = JSON.parse(JSON.stringify(incomingProduct));

            const productId = rawData.Products?.id || rawData.id || rawData.productId;

            if (!productId) throw new Error("Продукт должен иметь поле 'id' для переключения");

            const record = await db.regular_products.get('regular_products');
            let productList = record?.list || [];

            const productIndex = productList.findIndex(p =>
                p.id === productId || p.Products?.id === productId || p.productId === productId
            );

            store.updateRegularProducts = false

            if (productIndex === -1) {
                const productToAdd = {
                    ...rawData,
                    isActive: true,
                    savedAt: new Date().toISOString(),
                    order: productList.length
                };

                productList.push(productToAdd);
                await db.regular_products.put({
                    id: 'regular_products',
                    list: productList,
                    updatedAt: new Date().toISOString()
                });

                return { added: true, product: productToAdd };

            } else {
                const removedProduct = productList.splice(productIndex, 1)[0];
                await db.regular_products.put({
                    id: 'regular_products',
                    list: productList,
                    updatedAt: new Date().toISOString()
                });

                return { added: false, product: removedProduct };
            }

        } catch (error) {
            throw error;
        }
    };

    const reorderRegularProducts = async (draggedId, targetId) => {
        try {
            store.updateRegularProducts = true

            const record = await db.regular_products.get('regular_products');
            if (!record?.list) return false;

            let productList = [...record.list];

            const draggedIndex = productList.findIndex(p =>
                p.Products?.id === draggedId || p.id === draggedId
            );
            const targetIndex = productList.findIndex(p =>
                p.Products?.id === targetId || p.id === targetId
            );

            if (draggedIndex === -1 || targetIndex === -1) {
                return false;
            }

            [productList[draggedIndex], productList[targetIndex]] =
                [productList[targetIndex], productList[draggedIndex]];

            productList.forEach((item, index) => {
                item.order = index;
            });

            await db.regular_products.put({
                id: 'regular_products',
                list: productList,
                updatedAt: new Date().toISOString()
            });

            store.updateRegularProducts = false;
            return true;

        } catch (error) {
            store.updateRegularProducts = false;
            console.error('❌ Ошибка при перетаскивании:', error);
            throw error;
        }
    };

    const getSortedRegularProducts = async () => {
        try {
            const record = await db.regular_products.get('regular_products');
            if (!record?.list) return [];

            return [...record.list].sort((a, b) => {
                const orderA = a.order || 0;
                const orderB = b.order || 0;
                return orderA - orderB;
            });

        } catch (error) {
            console.error('Ошибка получения списка:', error);
            return [];
        }
    };

    return {
        formatPhone,
        routerState,
        findError,
        formatUZS,
        formatPhoneUZ,
        focusInput,
        saveRegularProduct,
        reorderRegularProducts,
        getSortedRegularProducts
    }
}

export const useOtpInput = (count = 4) => {
    const code = ref(new Array(count).fill(''));
    const inputs = ref([]);

    const handleInput = (index, event) => {
        const val = event.target.value.replace(/\D/g, ''); // Только цифры
        code.value[index] = val.slice(-1);

        if (val && index < count - 1) {
            inputs.value[index + 1].focus();
        }
    };

    const handleKeyDown = (index, event) => {
        if (event.key === 'Backspace' && !code.value[index] && index > 0) {
            inputs.value[index - 1].focus();
        }
    };

    const handlePaste = (event) => {
        const pasteData = event.clipboardData.getData('text').slice(0, count).split('');
        pasteData.forEach((char, i) => {
            if (/^\d$/.test(char)) code.value[i] = char;
        });
        const lastIdx = Math.min(pasteData.length, count - 1);
        inputs.value[lastIdx]?.focus();
    };

    const getFullCode = () => code.value.join('');

    return {
        code,
        inputs,
        handleInput,
        handleKeyDown,
        handlePaste,
        getFullCode
    };
};