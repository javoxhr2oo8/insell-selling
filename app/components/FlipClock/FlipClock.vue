<template>
    <div class="clock-container">
        <div class="clock">
            <template v-for="(digit, index) in timeArray" :key="'group-' + index">

                <div class="flip-card-wrapper">
                    <div class="flip-card">
                        <div class="top"><span>{{ digit.current }}</span></div>

                        <div class="bottom"><span>{{ digit.previous }}</span></div>

                        <div class="leaf" :class="{ 'flipping': digit.shouldFlip }"
                            @animationend="handleAnimationEnd(index)" :style="{ transform: digit.leafTransform }">
                            <div class="leaf-front"><span>{{ digit.previous }}</span></div>
                            <div class="leaf-back"><span>{{ digit.current }}</span></div>
                        </div>
                    </div>
                </div>

                <div v-if="index === 1 || index === 3" class="separator" :key="'sep-' + index">:</div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const timeArray = ref([
    { current: '', previous: '', shouldFlip: false, leafTransform: 'rotateX(0deg)' },
    { current: '', previous: '', shouldFlip: false, leafTransform: 'rotateX(0deg)' },
    { current: '', previous: '', shouldFlip: false, leafTransform: 'rotateX(0deg)' },
    { current: '', previous: '', shouldFlip: false, leafTransform: 'rotateX(0deg)' },
    { current: '', previous: '', shouldFlip: false, leafTransform: 'rotateX(0deg)' },
    { current: '', previous: '', shouldFlip: false, leafTransform: 'rotateX(0deg)' }
]);

const handleAnimationEnd = (index) => {
    timeArray.value[index].shouldFlip = false;
    timeArray.value[index].previous = timeArray.value[index].current;
    timeArray.value[index].leafTransform = 'rotateX(0deg)';
};

const updateTime = () => {
    const now = new Date();
    const timeStr =
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0') +
        String(now.getSeconds()).padStart(2, '0');

    timeStr.split('').forEach((digit, i) => {
        if (timeArray.value[i].current === '') {
            timeArray.value[i].current = digit;
            timeArray.value[i].previous = digit;
            return;
        }

        if (timeArray.value[i].current !== digit) {
            timeArray.value[i].previous = timeArray.value[i].current;
            timeArray.value[i].current = digit;
            timeArray.value[i].shouldFlip = true;
        }
    });
};

let timer;
onMounted(() => {
    updateTime();
    timer = setInterval(updateTime, 1000);
});

onUnmounted(() => clearInterval(timer));
</script>

<style lang="scss" scoped>
$width: 46px;
$height: 62px;
$bg-color: var(--pr-color);
$text-color: #fff;
$anim-speed: 0.6s;
$radius: 8px;

.clock-container {
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent;
}

.clock {
    display: flex;
    gap: 10px;
    align-items: center;
}

.separator {
    font-size: 40px;
    color: #444;
    font-weight: bold;
}

.flip-card {
    position: relative;
    width: $width;
    height: $height;
    line-height: $height;
    font-size: 40px;
    font-weight: bold;
    perspective: 600px;
    border-radius: $radius;

    .top,
    .bottom,
    .leaf-front,
    .leaf-back {
        position: absolute;
        left: 0;
        width: 100%;
        height: 50%;
        overflow: hidden;
        background: $bg-color;
        backface-visibility: hidden;
    }

    .top,
    .leaf-front {
        top: 0;
        border-radius: $radius $radius 0 0;
        border-bottom: 1px solid rgba(207, 207, 207, 0.055);
        z-index: 1;
    }

    .bottom,
    .leaf-back {
        bottom: 0;
        border-radius: 0 0 $radius $radius;
        z-index: 0;

        span {
            display: block;
            margin-top: -($height / 2);
        }
    }

    span {
        color: $text-color;
        width: 100%;
        display: block;
        text-align: center;
    }

    .leaf {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 50%;
        z-index: 2;
        transform-origin: bottom;
        transform-style: preserve-3d;
        /* transform управляется через style binding */

        &.flipping {
            animation: flip-anim $anim-speed ease-in forwards;
        }

        .leaf-front,
        .leaf-back {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }

        .leaf-back {
            transform: rotateX(-180deg);
            z-index: 3;
            background: $bg-color;
        }
    }
}

@keyframes flip-anim {
    0% {
        transform: rotateX(0deg);
    }

    100% {
        transform: rotateX(-180deg);
    }
}
</style>