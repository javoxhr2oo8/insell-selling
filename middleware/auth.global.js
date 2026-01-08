export default defineNuxtRouteMiddleware((to, from) => {
    const token = useCookie('auth_token')

    if (!token.value && to.path !== '/signIn') {
        return navigateTo('/signIn')
    }

    if (token.value && to.path === '/signIn') {
        return navigateTo('/')
    }
})