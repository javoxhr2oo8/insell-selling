<script setup>
import { useUtil } from '~/server/util';
import { useStore } from '~/store/store';
import { ToastInfo, ToastError } from '@/composables/toast';
import api from '~/server/api';

const store = useStore()

const { formatPhone, routerState } = useUtil()

const form = reactive({
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
});

function clearForm() {
    form.name = ""
    form.phone = ""
    form.password = ""
    form.confirmPassword = ""
}

const register = async () => {
    if (form.password !== form.confirmPassword) {
        ToastInfo("Parollar mos kelmadi!")
    } else {
        store.loader = true
        const res = await api.create_admin({
            name: form.name,
            password: form.password,
            phone: form.phone.replace(/\D/g, '')
        }).catch(err => err.response);
        store.loader = false
        if(res.status == 400) {
            ToastInfo(res?._data?.detail)
        }

        store.confirPhoneNumber = form.phone.replace(/\D/g, '')

        clearForm()


        const isErrorResponse = res && res.status && res.status >= 400;

        if (!isErrorResponse) {
            const data = typeof res === 'string' ? JSON.parse(res) : res;
            if (data.status === 'error') {
                // alert("Xatolik: " + data.message);
                ToastError("Xatolik")

            } else {
                console.log("Muvaffaqiyatli");
                routerState('confirm')
            }
        }
    }
};

const onPhoneInput = (event) => {
    const input = event.target;
    form.phone = formatPhone(input.value);
    input.value = phone.value;
};
</script>

<template>
    <main class="auth-page">
        <div class="auth-wrapper">
            <div class="sign-in-card">
                <form @submit.prevent="register()" class="auth-form">
                    <header class="auth-header">
                        <img src="@/assets/images/png/logo.png" alt="insell-logo" class="logo-img" />
                        <h2 class="auth-title">Ro'yixatdan o'tish</h2>
                        <p class="auth-subtitle">Iltimos hisobga kirish uchun login va parol kiriting</p>
                    </header>

                    <div class="auth-body">
                        <div class="input-field">
                            <label class="form-label">Ism</label>
                            <div class="custom-input-group">
                                <input type="tel" class="form-control-custom" v-model="form.name"
                                    placeholder="Ism kiriting" required autocomplete="off" />
                            </div>
                        </div>

                        <div class="input-field">
                            <label class="form-label">Telefon Raqam</label>
                            <div class="custom-input-group">
                                <span class="prefix">+998</span>
                                <input type="tel" @input="onPhoneInput" v-model="form.phone" class="form-control-custom"
                                    placeholder="Raqam kiriting" required autocomplete="off" />
                            </div>
                        </div>

                        <div class="input-field">
                            <label class="form-label">Parol</label>
                            <div class="custom-input-group">
                                <input type="password" class="form-control-custom" v-model="form.password"
                                    placeholder="Parol kiriting" required autocomplete="off" />
                            </div>
                        </div>

                        <div class="input-field">
                            <label class="form-label">Parol takrorlash</label>
                            <div class="custom-input-group">
                                <input type="password" class="form-control-custom" v-model="form.confirmPassword"
                                    placeholder="Parolni takror kiriting" required autocomplete="off" />
                                <div class="password-toggle cursor">
                                    <i class="fa-solid fa-eye"></i>
                                </div>
                            </div>
                        </div>

                        <div class="auth-actions">
                            <button class="insell-btn-main" type="submit">Ro'yixatdan o'tish</button>
                        </div>

                        <footer class="auth-footer">
                            <p class="fs-small register-p">
                                Hisobingiz mavjudmi?
                                <NuxtLink to="/signIn" class="text-insell fw-bold">Kirish</NuxtLink>
                            </p>
                        </footer>
                    </div>
                </form>
            </div>
        </div>
    </main>
</template>