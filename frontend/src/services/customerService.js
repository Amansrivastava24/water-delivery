import api from './api';

export const getCustomers = async (params = {}) => {
    const response = await api.get('/daily-customers', { params });
    return response.data;
};

export const getCustomer = async (id) => {
    const response = await api.get(`/daily-customers/${id}`);
    return response.data;
};

export const createCustomer = async (data) => {
    const response = await api.post('/daily-customers', data);
    return response.data;
};

export const updateCustomer = async (id, data) => {
    const response = await api.put(`/daily-customers/${id}`, data);
    return response.data;
};

export const deleteCustomer = async (id) => {
    const response = await api.delete(`/daily-customers/${id}`);
    return response.data;
};

export const getCustomerBalance = async (id) => {
    const response = await api.get(`/daily-customers/${id}/balance`);
    return response.data;
};
