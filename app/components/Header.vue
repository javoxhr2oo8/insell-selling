<script setup>
import { reloadPage } from '@/composables/reload';
const { theme, toggleTheme } = useTheme()
</script>

<template>
    <div>
        <div class="header">
            <div class="container">
                <div class="header-wrapper">
                    <div class="logo">
                        <NuxtLink to="/">
                            <img src="@/assets/images/png/logo.png" alt="">
                            <h2>SAVDO</h2>
                        </NuxtLink>
                    </div>

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
</template>