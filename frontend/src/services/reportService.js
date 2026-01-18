import api from './api';

export const getCustomerPaymentReport = async (params = {}) => {
    const response = await api.get('/reports/customer-payments', { params });
    return response.data;
};

export const getBulkOrderReport = async (params = {}) => {
    const response = await api.get('/reports/bulk-orders', { params });
    return response.data;
};

export const getDeliverySummary = async (params = {}) => {
    const response = await api.get('/reports/delivery-summary', { params });
    return response.data;
};

export const exportToCSV = async (type, params = {}) => {
    const response = await api.get('/reports/export', {
        params: { type, ...params },
        responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
};
