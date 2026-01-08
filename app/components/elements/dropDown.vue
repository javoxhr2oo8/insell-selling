<script setup>
import { useUtil } from '~/server/util';
const { data } = defineProps(['data'])

const { formatPhoneUZ } = useUtil()


onMounted(() => {
    console.log(data)
})
</script>

<template>
    <div class="drop-down">
        <div class="drop-down-wrapper">
            <div class="drop-down-item" v-for="item in data" :key="item">
                <span>{{ item.name }}</span>
                <span>{{ formatPhoneUZ(item.phone) }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.drop-down {
    width: 100%;
    height: 28vh;
    overflow: auto;
    margin-top: 15px;
    padding-right: 10px;
    position: absolute;
    background: var(--product-table-color);
    z-index: 10;

    .drop-down-wrapper {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .drop-down-item {
            border: 1px solid #c9c9c9;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 15px;
            cursor: pointer;

            span {
                color: var(--dark-color);
                opacity: 0.9;
                font-size: 20px;
            }
        }
    }
}

.drop-down::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

.drop-down::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.drop-down::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
    border: 2px solid #f1f1f1;
}

.drop-down::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>