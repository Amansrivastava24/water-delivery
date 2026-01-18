import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import MonthlyDeliveryView from '../components/MonthlyDeliveryView';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/customerService';
import { getTodayCustomersWithStatus, markDelivery } from '../services/deliveryService';
import './DailyCustomers.css';

const DailyCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState('all');
    const [viewMode, setViewMode] = useState('today'); // 'today' or 'monthly'
    const [deliveryStatuses, setDeliveryStatuses] = useState({}); // customerId -> delivered boolean
    const [loadingDeliveries, setLoadingDeliveries] = useState(new Set()); // Set of customerIds being updated
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        bottleType: '20L',
        pricePerBottle: 50,
        isActive: true
    });

    useEffect(() => {
        if (viewMode === 'today') {
            fetchCustomersWithDeliveryStatus();
        } else {
            fetchCustomers();
        }
    }, [viewMode]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await getCustomers();
            setCustomers(response.data);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomersWithDeliveryStatus = async () => {
        try {
            setLoading(true);
            const response = await getTodayCustomersWithStatus();
            setCustomers(response.data);

            // Build delivery status map
            const statusMap = {};
            response.data.forEach(customer => {
                statusMap[customer._id] = customer.deliveredToday;
            });
            setDeliveryStatuses(statusMap);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeliveryToggle = async (customerId, currentStatus) => {
        // Optimistic UI update
        setDeliveryStatuses(prev => ({
            ...prev,
            [customerId]: !currentStatus
        }));

        // Add to loading set
        setLoadingDeliveries(prev => new Set(prev).add(customerId));

        try {
            await markDelivery(customerId, !currentStatus);
            // Refresh to get updated data
            await fetchCustomersWithDeliveryStatus();
        } catch (err) {
            // Revert on error
            setDeliveryStatuses(prev => ({
                ...prev,
                [customerId]: currentStatus
            }));
            alert(err.message || 'Failed to update delivery status');
        } finally {
            // Remove from loading set
            setLoadingDeliveries(prev => {
                const newSet = new Set(prev);
                newSet.delete(customerId);
                return newSet;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCustomer) {
                await updateCustomer(editingCustomer._id, formData);
            } else {
                await createCustomer(formData);
            }
            setShowModal(false);
            resetForm();
            if (viewMode === 'today') {
                fetchCustomersWithDeliveryStatus();
            } else {
                fetchCustomers();
            }
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            address: customer.address,
            phone: customer.phone,
            bottleType: customer.bottleType,
            pricePerBottle: customer.pricePerBottle,
            isActive: customer.isActive
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await deleteCustomer(id);
                if (viewMode === 'today') {
                    fetchCustomersWithDeliveryStatus();
                } else {
                    fetchCustomers();
                }
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            address: '',
            phone: '',
            bottleType: '20L',
            pricePerBottle: 50,
            isActive: true
        });
        setEditingCustomer(null);
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm) ||
            customer.address.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterActive === 'all' ||
            (filterActive === 'active' && customer.isActive) ||
            (filterActive === 'inactive' && !customer.isActive);
        return matchesSearch && matchesFilter;
    });

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <Navbar />
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>👥 Daily Customers</h1>
                        <p>Manage your regular water delivery customers</p>
                    </div>
                    <div className="header-actions">
                        <select
                            className="view-selector"
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value)}
                        >
                            <option value="today">📋 Today's View</option>
                            <option value="monthly">📅 Monthly View</option>
                        </select>
                        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                            + Add Customer
                        </button>
                    </div>
                </div>

                {viewMode === 'monthly' ? (
                    <MonthlyDeliveryView />
                ) : (
                    <>
                        <div className="filters-bar">
                            <input
                                type="text"
                                className="form-input"
                                placeholder="🔍 Search customers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ maxWidth: '300px' }}
                            />
                            <div className="flex gap-sm">
                                <button
                                    className={`btn btn-sm ${filterActive === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setFilterActive('all')}
                                >
                                    All
                                </button>
                                <button
                                    className={`btn btn-sm ${filterActive === 'active' ? 'btn-success' : 'btn-secondary'}`}
                                    onClick={() => setFilterActive('active')}
                                >
                                    Active
                                </button>
                                <button
                                    className={`btn btn-sm ${filterActive === 'inactive' ? 'btn-secondary' : 'btn-secondary'}`}
                                    onClick={() => setFilterActive('inactive')}
                                >
                                    Inactive
                                </button>
                            </div>
                        </div>

                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>✓ Today</th>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Address</th>
                                        <th>Bottle Type</th>
                                        <th>Price</th>
                                        <th>Balance</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.map(customer => (
                                        <tr key={customer._id}>
                                            <td>
                                                <div className="checkbox-wrapper">
                                                    <input
                                                        type="checkbox"
                                                        className="delivery-checkbox"
                                                        checked={deliveryStatuses[customer._id] || false}
                                                        onChange={() => handleDeliveryToggle(customer._id, deliveryStatuses[customer._id])}
                                                        disabled={loadingDeliveries.has(customer._id)}
                                                        title={deliveryStatuses[customer._id] ? 'Mark as not delivered' : 'Mark as delivered'}
                                                    />
                                                    {loadingDeliveries.has(customer._id) && (
                                                        <span className="checkbox-spinner">⏳</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="font-semibold">{customer.name}</td>
                                            <td>{customer.phone}</td>
                                            <td>{customer.address}</td>
                                            <td><span className="badge badge-primary">{customer.bottleType}</span></td>
                                            <td>₹{customer.pricePerBottle}</td>
                                            <td className={customer.pendingBalance > 0 ? 'text-danger font-bold' : 'text-success'}>
                                                ₹{customer.pendingBalance?.toLocaleString('en-IN') || 0}
                                            </td>
                                            <td>
                                                <span className={`badge ${customer.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                    {customer.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-sm">
                                                    <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(customer)}>
                                                        Edit
                                                    </button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(customer._id)}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                <Modal
                    isOpen={showModal}
                    onClose={() => { setShowModal(false); resetForm(); }}
                    title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSubmit}>
                                {editingCustomer ? 'Update' : 'Create'}
                            </button>
                        </>
                    }
                >
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone *</label>
                            <input
                                type="tel"
                                className="form-input"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Address *</label>
                            <textarea
                                className="form-textarea"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Bottle Type *</label>
                            <select
                                className="form-select"
                                value={formData.bottleType}
                                onChange={(e) => setFormData({ ...formData, bottleType: e.target.value })}
                            >
                                <option value="20L">20L</option>
                                <option value="10L">10L</option>
                                <option value="5L">5L</option>
                                <option value="2L">2L</option>
                                <option value="1L">1L</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Price Per Bottle *</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.pricePerBottle}
                                onChange={(e) => setFormData({ ...formData, pricePerBottle: parseFloat(e.target.value) })}
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="flex items-center gap-sm" style={{ cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <span>Active Customer</span>
                            </label>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default DailyCustomers;
