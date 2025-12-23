import server from "./server";
import { db } from "./db";

export default {
    token: (userName, password) => {
        const formData = new URLSearchParams();
        formData.append('grant_type', 'password');
        formData.append('username', userName);
        formData.append('password', password);

        return server('token', 'post', formData);
    },

    refreshToken: (token) => server(`refresh_token?token=${token}`, 'post'),

    create_admin: (data) => server('create_admin', 'post', {
        name: data.name,
        password: data.password,
        phone: data.phone
    }),

    confirm_user: (phone, code) => server('confirm_user', 'put', {
        phone: phone,
        code: code
    }),

    create_order: (customerName, customerNumber) => server('create_order', 'post', {
        customer_name: customerName,
        customer_phone: customerNumber
    }),

    get_orders: (query) => server('get_orders', 'get', { ...query }),

    get_trades: (orderId, branchId) => server(`get_trades/${orderId}?branch_id=${branchId}`, 'get'),

    update_trade: (data) => server('update_trade', 'put', data),

    get_products: (query)=> server('get_products', 'get', query),

    to_tarde: (data) => server('to_trade', 'post', data),

    remove_trade: (trade_id) => server(`remove_trade/${trade_id}`, 'delete'),

    remove_order: (order_id) => server(`remove_order/${order_id}`, 'delete'),

    confirm_order: (data) => server('order_confirmation', 'put', data),

    get_kassa: (data) => server('get_kassa', 'get', data),

    get_users: (data) => server('get_users', 'get', data),

    get_customers: (query) => server('get_customers', 'get', query)
};


// import server from "./server";
// import { db } from "./db";

// const isOnline = () =>
//     typeof navigator !== "undefined" && navigator.onLine;

// const makeCacheKey = (url, payload) =>
//     `${url}_${JSON.stringify(payload || {})}`;

// const saveToQueue = async (url, method, payload) => {
//     await db.queue.add({
//         url,
//         method,
//         payload,
//         createdAt: Date.now()
//     });
// };

// const syncQueue = async () => {
//     if (!isOnline()) return;

//     const queue = await db.queue.toArray();

//     for (const item of queue) {
//         try {
//             await server(item.url, item.method, item.payload);
//             await db.queue.delete(item.id);
//         } catch (e) {
//             console.error("SYNC FAILED:", item.url);
//             break;
//         }
//     }
// };

// if (typeof window !== "undefined") {
//     window.addEventListener("online", syncQueue);
// }

// const offlineServer = async (url, method, payload = null) => {
//     const cacheKey = makeCacheKey(url, payload);

//     if (isOnline()) {
//         const response = await server(url, method, payload);

//         if (method === "get") {
//             await db.cache.put({
//                 key: cacheKey,
//                 data: response,
//                 updatedAt: Date.now()
//             });
//             console.log(response)
//         }

//         return response;
//     }

//     if (method === "get") {
//         const cached = await db.cache.get(cacheKey);
//         if (cached) return cached.data;

//         return Promise.reject({
//             offline: true,
//             message: "No cached data"
//         });
//     }

//     await saveToQueue(url, method, payload);
//     return {
//         offline: true,
//         message: "Saved locally"
//     };
// };

// export default {
//     token: (userName, password) => {
//         const formData = new URLSearchParams();
//         formData.append("grant_type", "password");
//         formData.append("username", userName);
//         formData.append("password", password);

//         return offlineServer("token", "post", formData);
//     },

//     refreshToken: (token) => offlineServer(`refresh_token?token=${token}`, "post"),

//     create_admin: (data) => offlineServer("create_admin", "post", {
//         name: data.name,
//         password: data.password,
//         phone: data.phone
//     }),

//     confirm_user: (phone, code) => offlineServer("confirm_user", "put", {
//         phone,
//         code
//     }),

//     create_order: (customerName, customerNumber) => offlineServer("create_order", "post", {
//         customer_name: customerName,
//         customer_phone: customerNumber
//     }),

//     get_orders: (query) => offlineServer("get_orders", "get", { ...query }),

//     get_trades: (orderId, branchId) => offlineServer(`get_trades/${orderId}?branch_id=${branchId}`, "get"),

//     update_trade: (data) => offlineServer("update_trade", "put", data),

//     get_products: (query) => offlineServer("get_products", "get", query),

//     to_tarde: (data) => offlineServer("to_trade", "post", data),

//     remove_trade: (trade_id) => offlineServer(`remove_trade/${trade_id}`, "delete"),

//     remove_order: (order_id) => offlineServer(`remove_order/${order_id}`, "delete"),

//     confirm_order: (data) => offlineServer("order_confirmation", "put", data),

//     get_kassa: (data) => offlineServer("get_kassa", "get", data),

//     get_users: (data) => offlineServer("get_users", "get", data)
// };