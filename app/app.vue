<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useStore } from '~/store/store'
import { useUtil } from './server/util'
import { db } from './server/db'
import api from './server/api'

const store = useStore()
const { routerState } = useUtil()

const tokenCookie = useCookie('access_token')

if (tokenCookie.value) {
  store.token = tokenCookie.value
}

if (process.client) {
  const savedData = localStorage.getItem('info')
  if (savedData) {
    try {
      const tokenInfo = JSON.parse(savedData)
      store.userInfo = tokenInfo
      if (!store.token) store.token = tokenInfo.access_token
    } catch (e) {
      console.error('Failed to parse auth data', e)
    }
  }

  if (!tokenCookie.value) {
    routerState('signIn')
  }
}

</script>

<template>
  <div>
    <NuxtLayout />
  </div>
</template>