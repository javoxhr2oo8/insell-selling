<script setup>
import { useStore } from '~/store/store';    
const { item } = defineProps(['item'])

const store = useStore()

function closefunc() {
    store.productDetailShow = true
    store.modalProducts = false
}
</script>

<template>
    <div class="product-item">
        <button @click="closefunc()">Mahsulot {{ item }}</button>
    </div>
</template>