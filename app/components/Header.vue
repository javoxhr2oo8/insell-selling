<script setup>
import { reloadPage } from '@/composables/reload';
import { useKey } from '@/composables/useKey';
import keyboardEventInfo from './elements/keyboardEventInfo.vue';
const { theme, toggleTheme } = useTheme()

useKey((eventData) => {
    if (eventData.ctrl && eventData.key === 'm') {
        toggleTheme()
        eventData.prevent()
    }
})
</script>

<template>
    <div>
        <div class="header">
            <div class="container">
                <div class="header-wrapper">
                    <div class="header-back-btn-and-title">
                        <button><img src="../assets/images/png/back-icon.png" alt=""></button>
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