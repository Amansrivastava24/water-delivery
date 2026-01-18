import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import KPICard from '../components/KPICard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getKPIs } from '../services/dashboardService';
import './Dashboard.css';

const Dashboard = () => {
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchKPIs();
    }, []);

    const fetchKPIs = async () => {
        try {
            const response = await getKPIs();
            setKpis(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <Navbar />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1>📊 Dashboard</h1>
                    <p>Overview of your water delivery business</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                {kpis && (
                    <>
                        <div className="kpi-grid">
                            <KPICard
                                title="Today's Total"
                                value={kpis.todayTotal}
                                icon="💰"
                                color="primary"
                            />
                            <KPICard
                                title="Monthly Income"
                                value={kpis.monthlyIncome}
                                icon="📈"
                                color="success"
                            />
                            <KPICard
                                title="Pending Payments"
                                value={kpis.pendingPayments}
                                icon="⏳"
                                color="warning"
                            />
                            <KPICard
                                title="Active Customers"
                                value={kpis.activeCustomers}
                                icon="👥"
                                color="primary"
                            />
                        </div>

                        <div className="stats-grid">
                            <div className="card">
                                <h3>📊 Income Overview</h3>
                                <div className="stat-row">
                                    <span>3 Months</span>
                                    <strong>₹{kpis.threeMonthIncome.toLocaleString('en-IN')}</strong>
                                </div>
                                <div className="stat-row">
                                    <span>6 Months</span>
                                    <strong>₹{kpis.sixMonthIncome.toLocaleString('en-IN')}</strong>
                                </div>
                                <div className="stat-row">
                                    <span>Yearly</span>
                                    <strong>₹{kpis.yearlyIncome.toLocaleString('en-IN')}</strong>
                                </div>
                            </div>

                            <div className="card">
                                <h3>📦 Quick Stats</h3>
                                <div className="stat-row">
                                    <span>Total Customers</span>
                                    <strong>{kpis.totalCustomers}</strong>
                                </div>
                                <div className="stat-row">
                                    <span>Today's Deliveries</span>
                                    <strong>{kpis.todayQuantity} bottles</strong>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
