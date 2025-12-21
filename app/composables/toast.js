import pkg from 'vue-toastification';

const { useToast } = pkg;

export const ToastSuccess = (text) => {
    if (process.client) {
        const toast = useToast();
        toast.success(text);
    }
}

export const ToastError = (text) => {
    if (process.client) {
        const toast = useToast();
        toast.error(text);
    }
}

export const ToastInfo = (text) => {
    if (process.client) {
        const toast = useToast();
        toast.info(text);
    }
}

export const ToastWarning = (text) => {
    if (process.client) {
        const toast = useToast();
        toast.warning(text);
    }
}