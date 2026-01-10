// export default async function server(endpoint, method = 'get', data = null, customHeaders = {}) {
//     const token = useCookie('access_token');
//     const config = useRuntimeConfig();

//     const options = {
//         method: method.toUpperCase(),
//         baseURL: config.public.apiBase || 'https://demo.api-insell.uz',
//         headers: {
//             'Accept': 'application/json',
//             ...customHeaders
//         },
//     };

//     if (token.value && !options.headers.Authorization) {
//         options.headers.Authorization = `Bearer ${token.value}`;
//     }

//     if (endpoint.includes('/token') && method.toLowerCase() === 'post') {
//         options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
//         const params = new URLSearchParams();
//         Object.keys(data).forEach(key => params.append(key, data[key]));
//         options.body = params;
//     } else {
//         options[method.toLowerCase() === 'get' ? 'params' : 'body'] = data;
//     }

//     return $fetch(endpoint, options);
// }

export default async function server(endpoint, method = 'get', data = null, customHeaders = {}) {
    const token = useCookie('access_token');
    const refreshToken = useCookie('refresh_token');
    const config = useRuntimeConfig();

    const options = {
        method: method.toUpperCase(),
        baseURL: config.public.apiBase || 'https://demo.api-insell.uz',
        headers: {
            'Accept': 'application/json',
            ...customHeaders
        },
    };

    if (token.value && !options.headers.Authorization) {
        options.headers.Authorization = `Bearer ${token.value}`;
    }

    if (endpoint.includes('/token') && method.toLowerCase() === 'post') {
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        const params = new URLSearchParams();
        Object.keys(data).forEach(key => params.append(key, data[key]));
        options.body = params;
    } else {
        options[method.toLowerCase() === 'get' ? 'params' : 'body'] = data;
    }

    try {
        return await $fetch(endpoint, options);
    } catch (err) {
        // for refresh token
        if (err?.response?.status === 401 && refreshToken.value) {
            try {
                const refreshResponse = await $fetch('/token/refresh', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        refresh_token: refreshToken.value
                    })
                });

                token.value = refreshResponse.access_token;
                refreshToken.value = refreshResponse.refresh_token;

                options.headers.Authorization = `Bearer ${token.value}`;
                return await $fetch(endpoint, options);

            } catch (refreshErr) {
                throw refreshErr;
            }
        }

        throw err;
    }
}