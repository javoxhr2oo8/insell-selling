<template>
    <div class="indicator-sending-wrp" :class="{ 'indicator-wrp-hidden': !isActive }">
        <div class="sending-indicator" :class="{ 'sending-indicator--active': isActive }">
            <div class="sending-indicator__circle">
                <div class="sending-indicator__ring sending-indicator__ring--outer"></div>

                <div class="sending-indicator__ring sending-indicator__ring--middle"></div>

                <div class="sending-indicator__ring sending-indicator__ring--inner"></div>

                <div class="sending-indicator__center"></div>

                <div v-for="i in anomaliesCount" :key="i" class="sending-indicator__anomaly"
                    :style="getAnomalyStyle(i)">
                </div>
            </div>

            <div class="sending-indicator__text">
                <span class="sending-indicator__text-main">
                    {{ text }}
                </span>
                <span class="sending-indicator__text-dots">
                    <span class="sending-indicator__dot">.</span>
                    <span class="sending-indicator__dot">.</span>
                    <span class="sending-indicator__dot">.</span>
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    isActive: {
        type: Boolean,
        default: false
    },
    text: {
        type: String,
        default: "Keshdagi malumotlar serverga jo'natilmoqda"
    },
    color: {
        type: String,
        default: '#4f46e5'
    },
    size: {
        type: String,
        default: 'medium',
        validator(value) {
            return ['small', 'medium', 'large'].includes(value)
        }
    }
})

const anomaliesCount = 8

// Функция для осветления цвета
const lightenColor = (color, percent) => {
    if (color.startsWith('#')) {
        const hex = color.replace('#', '')
        const num = parseInt(hex, 16)

        let r, g, b
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16)
            g = parseInt(hex[1] + hex[1], 16)
            b = parseInt(hex[2] + hex[2], 16)
        } else if (hex.length === 6) {
            r = (num >> 16) & 0xff
            g = (num >> 8) & 0xff
            b = num & 0xff
        } else {
            return color
        }

        const amt = Math.round(2.55 * percent)
        const R = Math.min(255, Math.max(0, r + amt))
        const G = Math.min(255, Math.max(0, g + amt))
        const B = Math.min(255, Math.max(0, b + amt))

        return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`
    }

    return color
}

// Вычисляем производные цвета
const middleRingColor = computed(() => lightenColor(props.color, 15))
const innerRingColor = computed(() => lightenColor(props.color, 30))

// Градиент для текста
const prColor = computed(() => {
    const middleColor = lightenColor(props.color, 20)
    return `linear-gradient(90deg, ${props.color}, ${middleColor})`
})

// Функция для генерации стилей аномалий
const getAnomalyStyle = (index) => {
    const angle = (index / anomaliesCount) * 2 * Math.PI
    const radius = 80
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius

    return {
        '--anomaly-index': index,
        '--anomaly-x': `${x}px`,
        '--anomaly-y': `${y}px`,
    }
}
</script>

<style lang="scss" scoped>
.indicator-sending-wrp {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.60);
    backdrop-filter: blur(20px);
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 1;
    visibility: visible;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}

.indicator-wrp-hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
}

.sending-indicator {
    --primary-color: v-bind('props.color');
    --middle-color: v-bind('middleRingColor');
    --inner-color: v-bind('innerRingColor');
    --pr-color: v-bind('prColor');

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    padding: 2rem;
    opacity: 0.7;
    transition: opacity 0.3s ease;

    &:hover {
        opacity: 1;
    }

    &--active {
        opacity: 1;

        .sending-indicator__ring {
            opacity: 1;
        }

        .sending-indicator__center {
            animation: pulse 2s ease-in-out infinite;
        }

        .sending-indicator__anomaly {
            animation: anomalyFloat 3s ease-in-out infinite;
        }

        .sending-indicator__text-dots {
            .sending-indicator__dot {
                animation: dotBlink 1.4s ease-in-out infinite;

                &:nth-child(2) {
                    animation-delay: 0.2s;
                }

                &:nth-child(3) {
                    animation-delay: 0.4s;
                }
            }
        }
    }

    &__circle {
        position: relative;
        width: 200px;
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &__ring {
        position: absolute;
        border-radius: 50%;
        border: 2px solid;
        opacity: 0.3;
        transition: opacity 0.3s ease;

        &--outer {
            width: 180px;
            height: 180px;
            border-color: var(--primary-color);
            animation: rotate 20s linear infinite;
            animation-play-state: paused;
        }

        &--middle {
            width: 140px;
            height: 140px;
            border-color: var(--middle-color);
            animation: rotate 15s linear infinite reverse;
            animation-play-state: paused;
        }

        &--inner {
            width: 100px;
            height: 100px;
            border-color: var(--inner-color);
            animation: rotate 10s linear infinite;
            animation-play-state: paused;
        }
    }

    &__center {
        width: 40px;
        height: 40px;
        background: var(--primary-color);
        border-radius: 50%;
        position: relative;
        z-index: 2;
        box-shadow:
            0 0 20px color-mix(in srgb, var(--primary-color) 50%, transparent),
            0 0 40px color-mix(in srgb, var(--primary-color) 30%, transparent),
            inset 0 0 10px rgba(255, 255, 255, 0.2);
    }

    &__anomaly {
        position: absolute;
        width: 12px;
        height: 12px;
        background: var(--primary-color);
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) translate(var(--anomaly-x), var(--anomaly-y));
        opacity: 0;
        filter: blur(1px);
        animation-delay: calc(var(--anomaly-index) * 0.1s);
        box-shadow: 0 0 15px var(--primary-color);
    }

    &__text {
        font-family: 'Segoe UI', system-ui, sans-serif;
        font-size: 1.5rem;
        font-weight: 500;
        text-align: center;
        color: #374151;
        display: flex;
        align-items: center;
        gap: 0.25rem;

        &-main {
            background: var(--pr-color);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 600;
        }

        &-dots {
            display: inline-flex;
        }
    }

    &__dot {
        opacity: 0;
    }
}

// Анимации включаются только когда активен
.sending-indicator--active {
    .sending-indicator__ring--outer {
        animation-play-state: running;
    }

    .sending-indicator__ring--middle {
        animation-play-state: running;
    }

    .sending-indicator__ring--inner {
        animation-play-state: running;
    }
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
        box-shadow:
            0 0 20px color-mix(in srgb, var(--primary-color) 50%, transparent),
            0 0 40px color-mix(in srgb, var(--primary-color) 30%, transparent),
            inset 0 0 10px rgba(255, 255, 255, 0.2);
    }

    50% {
        transform: scale(1.1);
        box-shadow:
            0 0 30px color-mix(in srgb, var(--primary-color) 70%, transparent),
            0 0 60px color-mix(in srgb, var(--primary-color) 40%, transparent),
            inset 0 0 15px rgba(255, 255, 255, 0.3);
    }
}

@keyframes anomalyFloat {

    0%,
    100% {
        opacity: 0;
        transform: translate(-50%, -50%) translate(var(--anomaly-x), var(--anomaly-y)) scale(0.5);
    }

    20%,
    80% {
        opacity: 0.8;
        transform: translate(-50%, -50%) translate(calc(var(--anomaly-x) * 1.1),
                calc(var(--anomaly-y) * 1.1)) scale(1.2);
    }

    50% {
        opacity: 1;
        transform: translate(-50%, -50%) translate(calc(var(--anomaly-x) * 1.3),
                calc(var(--anomaly-y) * 1.3)) scale(1);
    }
}

@keyframes dotBlink {

    0%,
    100% {
        opacity: 0;
    }

    50% {
        opacity: 1;
    }
}

@media (max-width: 768px) {
    .sending-indicator {
        &__circle {
            width: 150px;
            height: 150px;
        }

        &__ring {
            &--outer {
                width: 135px;
                height: 135px;
            }

            &--middle {
                width: 105px;
                height: 105px;
            }

            &--inner {
                width: 75px;
                height: 75px;
            }
        }

        &__center {
            width: 30px;
            height: 30px;
        }

        &__anomaly {
            width: 9px;
            height: 9px;
        }

        &__text {
            font-size: 1.2rem;
        }
    }
}

@media (prefers-color-scheme: dark) {
    .sending-indicator {
        &__text {
            color: #e5e7eb;

            &-main {    
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
        }
    }
}
</style>