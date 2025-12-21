<script setup>
import { useStore } from '~/store/store';
import { useUtil } from './server/util';

const router = useRouter()

const store = useStore()

const { routerState } = useUtil()

const tokenCookie = useCookie('access_token', {
  maxAge: 60 * 60 * 24 * 7,
  sameSite: 'lax',
  path: '/'
});

if (process.client) {
  const savedData = localStorage.getItem('info');
  let tokenInfo = null;

  try {
    tokenInfo = savedData ? JSON.parse(savedData) : null;
  } catch (e) {
    console.error("Failed to parse auth data", e);
  }

  if (tokenInfo && tokenInfo.access_token) {
    store.token = tokenInfo.access_token;
    store.userInfo = tokenInfo;
    tokenCookie.value = tokenInfo.access_token;
    routerState('');
  } else {
    routerState('signIn');
  }
}
</script>

<template>
  <div>
    <NuxtLayout />
    <loader v-if="store.loader" />
  </div>
</template>