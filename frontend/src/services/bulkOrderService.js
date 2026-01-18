import api from './api';

export const getBulkOrders = async (params = {}) => {
    const response = await api.get('/bulk-orders', { params });
    return response.data;
};

export const getBulkOrder = async (id) => {
    const response = await api.get(`/bulk-orders/${id}`);
    return response.data;
};

export const createBulkOrder = async (data) => {
    const response = await api.post('/bulk-orders', data);
    return response.data;
};

export const updateBulkOrder = async (id, data) => {
    const response = await api.put(`/bulk-orders/${id}`, data);
    return response.data;
};

export const deleteBulkOrder = async (id) => {
    const response = await api.delete(`/bulk-orders/${id}`);
    return response.data;
};

export const recordPayment = async (id, paidAmount) => {
    const response = await api.post(`/bulk-orders/${id}/payment`, { paidAmount });
    return response.data;
};
