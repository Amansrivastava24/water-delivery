import api from './api';

export const getDeliveries = async (params = {}) => {
    const response = await api.get('/deliveries', { params });
    return response.data;
};

export const getTodayDeliveries = async () => {
    const response = await api.get('/deliveries/today');
    return response.data;
};

export const createDelivery = async (data) => {
    const response = await api.post('/deliveries', data);
    return response.data;
};

export const updateDelivery = async (id, data) => {
    const response = await api.put(`/deliveries/${id}`, data);
    return response.data;
};

export const recordPayment = async (id, paidAmount) => {
    const response = await api.post(`/deliveries/${id}/payment`, { paidAmount });
    return response.data;
};

/**
 * Get all customers with today's delivery status
 */
export const getTodayCustomersWithStatus = async () => {
    const response = await api.get('/deliveries/today/customers');
    return response.data;
};

/**
 * Mark or unmark delivery for a customer
 */
export const markDelivery = async (customerId, delivered, quantity = 1, deliveryDate = null) => {
    const response = await api.post('/deliveries/mark', {
        customerId,
        delivered,
        quantity,
        deliveryDate
    });
    return response.data;
};

/**
 * Get monthly delivery matrix for all customers
 */
export const getMonthlyDeliveries = async (month, customerId = null) => {
    const params = { month };
    if (customerId) {
        params.customerId = customerId;
    }
    const response = await api.get('/deliveries/monthly', { params });
    return response.data;
};
