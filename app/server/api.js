import server from "./server";

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

    get_users: (data) => server('get_users', 'get', data)
};