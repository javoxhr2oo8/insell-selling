// plugins/toast.client.js
import { defineNuxtPlugin } from '#app'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(Toast, {
        // Здесь можно указать глобальные настройки
        position: 'bottom-left',
        timeout: 3000,
        closeOnClick: true,
        pauseOnHover: true,
    })
})