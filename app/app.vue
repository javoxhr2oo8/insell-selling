<script setup>
import { useStore } from '~/store/store';
import { useUtil } from './server/util';

const store = useStore()
const { routerState } = useUtil()

const tokenCookie = useCookie('access_token');

if (tokenCookie.value) {
  store.token = tokenCookie.value;
}

if (process.client) {
  const savedData = localStorage.getItem('info');
  if (savedData) {
    try {
      const tokenInfo = JSON.parse(savedData);
      store.userInfo = tokenInfo;
      if (!store.token) store.token = tokenInfo.access_token;
    } catch (e) {
      console.error("Failed to parse auth data", e);
    }
  }

  if (!tokenCookie.value) {
    routerState('signIn');
  }
}
</script>

<template>
  <div>
    <NuxtLayout />
    <!-- <loader v-if="store.loader" /> -->
  </div>
</template>