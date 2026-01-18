import React, { useState, useEffect } from 'react';
import { getMonthlyDeliveries } from '../services/deliveryService';
import LoadingSpinner from './LoadingSpinner';
import './MonthlyDeliveryView.css';

const MonthlyDeliveryView = () => {
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');

    // Initialize with current month
    useEffect(() => {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        setSelectedMonth(currentMonth);
    }, []);

    // Fetch data when month changes
    useEffect(() => {
        if (selectedMonth) {
            fetchMonthlyData();
        }
    }, [selectedMonth]);

    const fetchMonthlyData = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await getMonthlyDeliveries(selectedMonth);
            setMonthlyData(response.data || []);
        } catch (err) {
            setError(err.message || 'Failed to load monthly data');
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (monthlyData.length === 0) return;

        // Get days in month
        const daysInMonth = monthlyData[0]?.dailyStatus?.length || 0;

        // Create CSV header
        let csv = 'Customer Name,Bottle Type,';
        for (let day = 1; day <= daysInMonth; day++) {
            csv += `Day ${day},`;
        }
        csv += 'Total Delivered\n';

        // Add rows
        monthlyData.forEach(customer => {
            csv += `${customer.customerName},${customer.bottleType},`;
            let totalDelivered = 0;

            customer.dailyStatus.forEach(day => {
                if (day.delivered === true) {
                    csv += '✓,';
                    totalDelivered++;
                } else if (day.delivered === false) {
                    csv += '✗,';
                } else {
                    csv += '-,';
                }
            });

            csv += `${totalDelivered}\n`;
        });

        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `deliveries-${selectedMonth}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (monthlyData.length === 0) {
        return (
            <div className="monthly-view-container">
                <div className="monthly-header">
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="month-selector"
                    />
                </div>
                <div className="no-data">No customers found for this month</div>
            </div>
        );
    }

    const daysInMonth = monthlyData[0]?.dailyStatus?.length || 0;

    return (
        <div className="monthly-view-container">
            <div className="monthly-header">
                <div className="header-left">
                    <h2>Monthly Delivery Calendar</h2>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="month-selector"
                    />
                </div>
                <button onClick={exportToCSV} className="btn-export">
                    📥 Export to CSV
                </button>
            </div>

            <div className="monthly-grid-wrapper">
                <table className="monthly-grid">
                    <thead>
                        <tr>
                            <th className="sticky-col customer-col">Customer</th>
                            <th className="sticky-col bottle-col">Type</th>
                            {Array.from({ length: daysInMonth }, (_, i) => (
                                <th key={i + 1} className="day-col">
                                    {i + 1}
                                </th>
                            ))}
                            <th className="sticky-col-right total-col">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthlyData.map((customer) => {
                            const totalDelivered = customer.dailyStatus.filter(
                                (day) => day.delivered === true
                            ).length;

                            return (
                                <tr key={customer.customerId}>
                                    <td className="sticky-col customer-col">
                                        {customer.customerName}
                                    </td>
                                    <td className="sticky-col bottle-col">
                                        {customer.bottleType}
                                    </td>
                                    {customer.dailyStatus.map((day) => (
                                        <td
                                            key={day.day}
                                            className={`day-cell ${day.delivered === true
                                                    ? 'delivered'
                                                    : day.delivered === false
                                                        ? 'not-delivered'
                                                        : 'no-data'
                                                }`}
                                            title={
                                                day.delivered !== null
                                                    ? `${day.date}: ${day.delivered ? 'Delivered' : 'Not Delivered'
                                                    } - Qty: ${day.quantity}`
                                                    : 'No data'
                                            }
                                        >
                                            {day.delivered === true
                                                ? '✓'
                                                : day.delivered === false
                                                    ? '✗'
                                                    : '-'}
                                        </td>
                                    ))}
                                    <td className="sticky-col-right total-col">
                                        <strong>{totalDelivered}</strong>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="monthly-summary">
                <div className="summary-item">
                    <span className="summary-label">Total Customers:</span>
                    <span className="summary-value">{monthlyData.length}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Legend:</span>
                    <span className="legend">
                        <span className="legend-item">
                            <span className="legend-icon delivered">✓</span> Delivered
                        </span>
                        <span className="legend-item">
                            <span className="legend-icon not-delivered">✗</span> Not Delivered
                        </span>
                        <span className="legend-item">
                            <span className="legend-icon no-data">-</span> No Data
                        </span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MonthlyDeliveryView;
