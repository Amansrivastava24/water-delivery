import api from './api';

export const getKPIs = async () => {
    const response = await api.get('/dashboard/kpis');
    return response.data;
};

export const getRevenueTrend = async (days = 30) => {
    const response = await api.get('/dashboard/revenue-trend', { params: { days } });
    return response.data;
};

export const getMonthlyComparison = async () => {
    const response = await api.get('/dashboard/monthly-comparison');
    return response.data;
};
