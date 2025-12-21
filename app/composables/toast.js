import { useToast } from "vue-toastification";

const toast = useToast();

export const ToastSuccess = (text) => {
    toast.success(text);
}

export const ToastError = (text) => {
    toast.error(text);
}

export const ToastInfo = (text) => {
    toast.info(text);
}

export const ToastWarning = (text) => {
    toast.warning(text);
}