import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendOTP, verifyOTP } from '../services/authService';
import './Login.css';

const Login = () => {
    const [step, setStep] = useState(1); // 1: email, 2: OTP
    const [email, setEmail] = useState('');
    const [otp, setOTP] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [devOTP, setDevOTP] = useState(''); // For development

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await sendOTP(email);

            // In development, show the OTP
            if (response.otp) {
                setDevOTP(response.otp);
            }

            setStep(2);
        } catch (err) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await verifyOTP(email, otp, name, phone);
            login(response.token, response.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="bubble bubble-1"></div>
                <div className="bubble bubble-2"></div>
                <div className="bubble bubble-3"></div>
            </div>

            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon">💧</div>
                    <h1>Water Delivery</h1>
                    <p>Management System</p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} className="login-form">
                        <h2>Welcome Back</h2>
                        <p className="login-subtitle">Enter your email to receive OTP</p>

                        {error && <div className="alert alert-error">{error}</div>}

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>

                        <p className="login-hint">
                            💡 Test emails: admin@waterdelivery.com or worker@waterdelivery.com
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="login-form">
                        <h2>Verify OTP</h2>
                        <p className="login-subtitle">Enter the 6-digit code sent to {email}</p>

                        {error && <div className="alert alert-error">{error}</div>}
                        {devOTP && (
                            <div className="alert alert-success">
                                🔐 Development OTP: <strong>{devOTP}</strong>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">OTP Code</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOTP(e.target.value)}
                                maxLength={6}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Name (Optional)</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone (Optional)</label>
                            <input
                                type="tel"
                                className="form-input"
                                placeholder="Phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-md">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setStep(1)}
                                style={{ flex: 1 }}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                style={{ flex: 1 }}
                            >
                                {loading ? 'Verifying...' : 'Verify & Login'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
