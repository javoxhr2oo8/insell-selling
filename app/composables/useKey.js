export const useKey = (fn, type = 'keydown', el = window) => {
    const handler = e => fn({
        e, key: e.key, code: e.code,
        ctrl: e.ctrlKey, shift: e.shiftKey, alt: e.altKey, meta: e.metaKey,
        target: e.target, repeat: e.repeat,
        stop: () => e.stopPropagation(),
        prevent: () => e.preventDefault()
    })

    onMounted(() => el.addEventListener(type, handler))
    onBeforeUnmount(() => el.removeEventListener(type, handler))
}