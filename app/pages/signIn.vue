<script setup>
import api from '~/server/api';
import { useStore } from '~/store/store';
import { useUtil } from '~/server/util';
import { ToastSuccess, ToastError } from '#imports';

const { formatPhone, routerState } = useUtil()

const store = useStore()

const data = reactive({
    username: '',
    password: ''
})

const pasType = ref(true)

function cleanValue() {
    data.username = ''
    data.password = ''
}

const signIn = async () => {
    const phoneToSubmit = (data.username || '').replace(/\D/g, '');
    const passwordToSubmit = data.password;

    store.loader = true

    const res = await api.token(phoneToSubmit, passwordToSubmit).catch((err)=> {
        ToastError(err.response._data.detail)
        store.loader = false
        cleanValue()
    })

    if (res?.access_token) {
        localStorage.setItem('info', JSON.stringify(res))

        const tokenCookie = useCookie('access_token')
        tokenCookie.value = res.access_token

        ToastSuccess('Muvofaqiyatlik')

        routerState('')
        cleanValue()

    } else {
        ToastError(res.detail)
        cleanValue()
    }

    store.loader = false
}

const onPhoneInput = (event) => {
    const input = event.target;
    data.username = formatPhone(input.value);
    input.value = data.username;
};
</script>

<template>
    <main class="auth-page">

        <div class="auth-wrapper">
            <div class="sign-in-card">
                <form class="auth-form" @submit.prevent="signIn()">
                    <header class="auth-header">
                        <img src="@/assets/images/png/logo.png" alt="insell-logo" class="logo-img" />
                        <h2 class="auth-title">Hisobga kirish</h2>
                        <p class="auth-subtitle">Iltimos hisobga kirish uchun login va parol kiriting</p>
                    </header>

                    <div class="auth-body">
                        <div class="input-field">
                            <label class="form-label">Login</label>
                            <div class="custom-input-group">
                                <span class="prefix">+998</span>
                                <input type="tel" @input="onPhoneInput" v-model="data.username"
                                    class="form-control-custom" placeholder="Raqam kiriting" required
                                    autocomplete="off" />
                            </div>
                        </div>

                        <div class="input-field">
                            <label class="form-label">Parol</label>
                            <div class="custom-input-group">
                                <input :type="pasType ? 'password' : 'text'" v-model="data.password" class="form-control-custom"
                                    placeholder="Parol kiriting" required autocomplete="off" />
                                <div class="password-toggle cursor">
                                    <i class="fa-solid fa-eye" @click="pasType = !pasType"></i>
                                </div>
                            </div>
                            <div class="helper-text-end">
                                <a class="text-insell fs-small cursor">Parolni unutdingizmi?</a>
                            </div>
                        </div>

                        <div class="auth-actions">
                            <button class="insell-btn-main" type="submit">KIRISH</button>
                        </div>

                        <footer class="auth-footer">
                            <p class="fs-small">
                                Hali hisobingiz mavjud emasmi?
                                <NuxtLink to="/register" class="text-insell fw-bold">Ro‘yxatdan o‘tish</NuxtLink>
                            </p>
                        </footer>
                    </div>
                </form>
            </div>
        </div>
    </main>
</template>