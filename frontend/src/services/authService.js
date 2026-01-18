import api from './api';

/**
 * Authentication Service
 * Handles OTP-based authentication
 */

export const sendOTP = async (email) => {
    const response = await api.post('/auth/send-otp', { email });
    return response.data;
};

export const verifyOTP = async (email, otp, name, phone) => {
    const response = await api.post('/auth/verify-otp', { email, otp, name, phone });
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};
