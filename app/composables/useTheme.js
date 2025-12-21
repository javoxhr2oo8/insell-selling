export const useTheme = () => {
    const theme = useState('theme', () => 'dark')

    const applyTheme = (value) => {
        document.body.classList.remove('light', 'dark')
        document.body.classList.add(value)
    }

    const toggleTheme = () => {
        theme.value = theme.value === 'dark' ? 'light' : 'dark'
        applyTheme(theme.value)
        localStorage.setItem('theme', theme.value)
    }

    onMounted(() => {
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme) {
            theme.value = savedTheme
        }
        applyTheme(theme.value)
    })

    return {
        theme,
        toggleTheme,
    }
}