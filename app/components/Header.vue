<script setup>
import { reloadPage } from '@/composables/reload';
import { useKey } from '@/composables/useKey';
import keyboardEventInfo from './elements/keyboardEventInfo.vue';
import DeleteAlertModal from './AlertModal/DeleteAlertModal.vue';
import { useUtil } from '~/server/util';
const { theme, toggleTheme } = useTheme()

const { routerState } = useUtil()

useKey((eventData) => {
    if (eventData.ctrl && eventData.key === 'm') {
        toggleTheme()
        eventData.prevent()
    }
})

const logoutModal = ref(false)

function logOut() {
    routerState('signIn')

    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    localStorage.clear();

    window.location.href = "/signIn";
}
</script>

<template>
    <div>
        <div class="header">
            <div class="container">
                <div class="header-wrapper">
                    <div class="header-back-btn-and-title">
                        <!-- <button><img src="../assets/images/png/back-icon.png" alt=""></button> -->
                        <button @click="logoutModal = true"><i class="fas fa-sign-out-alt"></i></button>
                        <h2 class="main-title">Savdo bo'limi</h2>
                    </div>

                    <div class="logo">
                        <NuxtLink to="/">
                            <img src="@/assets/images/png/logo.png" alt="">
                        </NuxtLink>
                    </div>

                    <FlipClock class="mini-screen-clock" />

                    <div class="header-actions-and-clock">
                        <FlipClock class="usually-clock-deskt-top" />
                        <div class="header-actions">
                            <button @click="reloadPage()">
                                <i class="fas fa-rotate"></i>
                                <span>0</span>
                            </button>
                            <button @click="toggleTheme">
                                <i class="fa-solid fa-sun" v-if="theme === 'dark'"></i>
                                <i class="fa-solid fa-moon" v-if="theme !== 'dark'"></i>
                                <keyboardEventInfo class="keyboard-com-to-mode">
                                    <h3>CTRL + M</h3>
                                </keyboardEventInfo>
                            </button>
                            <button>
                                <i class="fa-solid fa-bell"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <DeleteAlertModal v-model:isOpen="logoutModal">
            <template #body>
                <div class="delete-content">
                    <p class="final-warning">
                        Siz rostan ham tizimdan chiqmoqchimisiz?
                    </p>
                </div>
            </template>

            <template #footer>
                <div class="custom-footer">
                    <button class="btn-custom-cancel" @click="logoutModal = false">
                        Yo’q, ortga qaytish
                    </button>
                    <button class="btn-custom-delete" @click="logOut()">
                        Ha, chiqmoqchiman
                    </button>
                </div>
            </template>
        </DeleteAlertModal>
    </div>
</template>

<style lang="scss" scoped>
.keyboard-com-to-mode {
    width: 120px;
    position: absolute;
    left: -30px;
    top: 45px;
    z-index: 10;
    transition: all 1s ease;
    display: none;
}

.mini-screen-clock {
    display: none;

    @media screen and (max-width: 1164px) {
        display: flex;
    }
}

.usually-clock-deskt-top {
    @media screen and (max-width: 1164px) {
        display: none;
    }
}
</style>