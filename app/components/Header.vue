<script setup>
import { reloadPage } from '@/composables/reload';
const { theme, toggleTheme } = useTheme()
</script>

<template>
    <div>
        <div class="header">
            <div class="container">
                <div class="header-wrapper">
                    <div class="header-back-btn-and-title">
                        <button><img src="../assets/images/png/back-icon.png" alt=""></button>
                        <div class="logo">
                            <NuxtLink to="/">
                                <img src="@/assets/images/png/logo.png" alt="">
                                <h2>Savdo bo'limi</h2>
                            </NuxtLink>
                        </div>
                    </div>

                    <FlipClock class="mini-screen-clock" />

                    <div class="header-actions-and-clock">
                        <FlipClock class="usually-clock-deskt-top" />
                        <div class="header-actions">
                            <button @click="reloadPage()">
                                <i class="fas fa-rotate"></i>
                            </button>
                            <button @click="toggleTheme">
                                <i class="fa-solid fa-sun" v-if="theme === 'dark'"></i>
                                <i class="fa-solid fa-moon" v-if="theme !== 'dark'"></i>
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