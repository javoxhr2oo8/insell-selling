<script setup>
import { useOtpInput, useUtil } from '~/server/util';
import { ToastSuccess, ToastError } from '#imports';
import api from '~/server/api';
import { useStore } from '~/store/store';

const { code, inputs, handleInput, handleKeyDown, handlePaste, getFullCode } = useOtpInput(4);
const {routerState} = useUtil()

const store = useStore()

const submitForm = async () => {
    const finalCode = getFullCode();
    if (finalCode.length < 4) return alert("Kodni to'liq kiring");
    console.log("Tayyor kod:", finalCode);

    store.loader = true
    const res = await api.confirm_user(store.confirPhoneNumber, finalCode)
    store.loader = false
    
    if(res.status == true) {
        routerState("signIn")
        ToastSuccess('Muvofaqiyatlik')
    } else {
        ToastError("Xatolik!")
    }
};
</script>

<template>
    <main class="confirm-page">
        <div class="confirm-card">
            <div class="confirm-card__header">
                <img src="@/assets/images/png/logo.png" alt="insell-logo" class="confirm-card__logo" />
                <h2 class="confirm-card__title">Kodni tasdiqlash</h2>
                <p class="confirm-card__subtitle">
                    Tasdiqlash kodi <span class="phone-number">+998 {{ store.confirPhoneNumber }}</span> raqamiga yuborildi
                </p>
            </div>

            <form class="confirm-form" @submit.prevent="submitForm()">
                <div class="code-group">
                    <input v-for="(digit, i) in 4" :key="i" ref="inputs" v-model="code[i]" type="text" maxlength="1"
                        class="code-group__input" inputmode="numeric" placeholder="-" @input="handleInput(i, $event)"
                        @keydown="handleKeyDown(i, $event)" />
                </div>

                <button type="submit" class="btn-submit">
                    Tasdiqlash
                </button>

                <div class="resend-section">
                    <p v-if="true" class="resend-section__timer">
                        Kodni qayta yuborish: <span>00:59</span>
                    </p>
                    <button v-else type="button" class="resend-section__link">
                        Kodni qayta yuborish
                    </button>
                </div>
            </form>
        </div>
    </main>
</template>

<style scoped lang="scss">
$primary-color: #ff6b2c;
$text-dark: #fff;
$text-gray: var(--dark-color);
$border-color: #e9ecef;
$bg-light: var(--bg-color);
$white: #ffffff;

.confirm-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $bg-light;
    padding: 20px;

    .confirm-card {
        background: var(--tr-hover-color);
        max-width: 420px;
        width: 100%;
        padding: 48px 32px;
        border-radius: 24px;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.04);
        text-align: center;

        &__logo {
            width: 130px;
            margin-bottom: 24px;
        }

        &__title {
            font-size: 26px;
            font-weight: 700;
            color: $text-dark;
            margin-bottom: 12px;
        }

        &__subtitle {
            font-size: 15px;
            color: $text-gray;
            line-height: 1.6;
            margin-bottom: 32px;

            .phone-number {
                display: block;
                color: $text-dark;
                font-weight: 600;
                margin-top: 4px;
            }
        }
    }
}

.code-group {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-bottom: 32px;

    &__input {
        width: 60px;
        height: 72px;
        background: $bg-light;
        border: 2px solid $border-color;
        border-radius: 16px;
        font-size: 32px;
        font-weight: 700;
        text-align: center;
        color: $primary-color;
        transition: all 0.25s ease-in-out;

        &:focus {
            outline: none;
            border-color: $primary-color;
            box-shadow: 0 0 0 4px rgba($primary-color, 0.1);
            transform: translateY(-2px);
        }

        &::placeholder {
            color: darken($border-color, 10%);
        }
    }
}

.btn-submit {
    width: 100%;
    padding: 16px;
    background: $primary-color;
    color: $white;
    border: none;
    border-radius: 16px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, background 0.2s;

    &:hover {
        background: darken($primary-color, 10%);
    }

    &:active {
        transform: scale(0.98);
    }
}

.resend-section {
    margin-top: 24px;

    &__timer {
        font-size: 14px;
        color: $text-gray;

        span {
            color: $text-dark;
            font-weight: 700;
        }
    }

    &__link {
        background: none;
        border: none;
        color: $primary-color;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        padding: 4px 8px;

        &:hover {
            text-decoration: underline;
        }
    }
}

@media (max-width: 480px) {
    .confirm-card {
        padding: 32px 20px;

        .code-group {
            gap: 8px;

            &__input {
                width: 50px;
                height: 64px;
                font-size: 24px;
            }
        }
    }
}
</style>