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

    return {
        formatPhone,
        routerState,
        findError,
        formatUZS
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