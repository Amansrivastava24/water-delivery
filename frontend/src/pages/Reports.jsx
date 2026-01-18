import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCustomerPaymentReport, getBulkOrderReport, getDeliverySummary, exportToCSV } from '../services/reportService';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('customers');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchReport();
    }, [activeTab]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            let response;
            if (activeTab === 'customers') {
                response = await getCustomerPaymentReport(params);
            } else if (activeTab === 'bulk-orders') {
                response = await getBulkOrderReport(params);
            } else {
                response = await getDeliverySummary(params);
            }
            setData(response);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            await exportToCSV(activeTab, { startDate, endDate });
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>📈 Reports</h1>
                        <p>Generate and export business reports</p>
                    </div>
                    <button className="btn btn-success" onClick={handleExport}>
                        📥 Export to CSV
                    </button>
                </div>

                <div className="card mb-lg">
                    <div className="flex gap-md items-center" style={{ flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
                            <label className="form-label">Start Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
                            <label className="form-label">End Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-primary" onClick={fetchReport} style={{ marginTop: '24px' }}>
                            Generate Report
                        </button>
                    </div>
                </div>

                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'customers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('customers')}
                    >
                        Customer Payments
                    </button>
                    <button
                        className={`tab ${activeTab === 'bulk-orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bulk-orders')}
                    >
                        Bulk Orders
                    </button>
                    <button
                        className={`tab ${activeTab === 'deliveries' ? 'active' : ''}`}
                        onClick={() => setActiveTab('deliveries')}
                    >
                        Delivery Summary
                    </button>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : data ? (
                    <>
                        {data.totals && (
                            <div className="card mb-lg">
                                <h3>Summary</h3>
                                <div className="stats-grid">
                                    {Object.entries(data.totals).map(([key, value]) => (
                                        <div key={key} className="stat-row">
                                            <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                            <strong>
                                                {typeof value === 'number' ?
                                                    (key.toLowerCase().includes('amount') || key.toLowerCase().includes('paid') || key.toLowerCase().includes('pending') || key.toLowerCase().includes('billed') ?
                                                        `₹${value.toLocaleString('en-IN')}` : value)
                                                    : value}
                                            </strong>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        {activeTab === 'customers' && (
                                            <>
                                                <th>Name</th>
                                                <th>Phone</th>
                                                <th>Bottle Type</th>
                                                <th>Total Billed</th>
                                                <th>Total Paid</th>
                                                <th>Pending</th>
                                                <th>Status</th>
                                            </>
                                        )}
                                        {activeTab === 'bulk-orders' && (
                                            <>
                                                <th>Customer</th>
                                                <th>Event Type</th>
                                                <th>Quantity</th>
                                                <th>Total Amount</th>
                                                <th>Paid</th>
                                                <th>Pending</th>
                                                <th>Status</th>
                                            </>
                                        )}
                                        {activeTab === 'deliveries' && (
                                            <>
                                                <th>Customer</th>
                                                <th>Date</th>
                                                <th>Quantity</th>
                                                <th>Amount</th>
                                                <th>Paid</th>
                                                <th>Status</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.data?.map((item, index) => (
                                        <tr key={index}>
                                            {activeTab === 'customers' && (
                                                <>
                                                    <td className="font-semibold">{item.name}</td>
                                                    <td>{item.phone}</td>
                                                    <td><span className="badge badge-primary">{item.bottleType}</span></td>
                                                    <td>₹{item.totalBilled.toLocaleString('en-IN')}</td>
                                                    <td className="text-success">₹{item.totalPaid.toLocaleString('en-IN')}</td>
                                                    <td className="text-danger">₹{item.pendingBalance.toLocaleString('en-IN')}</td>
                                                    <td>
                                                        <span className={`badge ${item.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                            {item.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
                                            {activeTab === 'bulk-orders' && (
                                                <>
                                                    <td className="font-semibold">{item.customerName}</td>
                                                    <td><span className="badge badge-primary">{item.eventType}</span></td>
                                                    <td>{item.quantity} × {item.bottleType}</td>
                                                    <td>₹{item.totalAmount.toLocaleString('en-IN')}</td>
                                                    <td className="text-success">₹{item.paidAmount.toLocaleString('en-IN')}</td>
                                                    <td className="text-danger">₹{item.pendingAmount.toLocaleString('en-IN')}</td>
                                                    <td>
                                                        <span className={`badge ${item.paymentStatus === 'paid' ? 'badge-success' :
                                                                item.paymentStatus === 'partial' ? 'badge-warning' : 'badge-danger'
                                                            }`}>
                                                            {item.paymentStatus}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
                                            {activeTab === 'deliveries' && (
                                                <>
                                                    <td className="font-semibold">{item.customerName}</td>
                                                    <td>{new Date(item.deliveryDate).toLocaleDateString()}</td>
                                                    <td>{item.quantityDelivered}</td>
                                                    <td>₹{item.amountBilled.toLocaleString('en-IN')}</td>
                                                    <td className="text-success">₹{item.paidAmount.toLocaleString('en-IN')}</td>
                                                    <td>
                                                        <span className={`badge ${item.isPaid ? 'badge-success' : 'badge-warning'}`}>
                                                            {item.isPaid ? 'Paid' : 'Pending'}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="card text-center">
                        <p>Click "Generate Report" to view data</p>
                    </div>
                )}
            </div>

            <style jsx>{`
        .tabs {
          display: flex;
          gap: var(--space-sm);
          margin-bottom: var(--space-lg);
          border-bottom: 2px solid var(--border);
        }

        .tab {
          padding: var(--space-md) var(--space-lg);
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all var(--transition-base);
        }

        .tab:hover {
          color: var(--text-primary);
        }

        .tab.active {
          color: var(--primary-600);
          border-bottom-color: var(--primary-600);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-md);
        }
      `}</style>
        </div>
    );
};

export default Reports;
