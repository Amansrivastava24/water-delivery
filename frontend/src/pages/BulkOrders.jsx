import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { getBulkOrders, createBulkOrder, updateBulkOrder, deleteBulkOrder, recordPayment } from '../services/bulkOrderService';

const BulkOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [formData, setFormData] = useState({
        customerName: '',
        phone: '',
        address: '',
        eventType: 'wedding',
        quantity: 1,
        bottleType: '20L',
        pricePerBottle: 45,
        deliveryDates: [''],
        notes: ''
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await getBulkOrders();
            setOrders(response.data);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                deliveryDates: formData.deliveryDates.filter(d => d)
            };
            if (editingOrder) {
                await updateBulkOrder(editingOrder._id, data);
            } else {
                await createBulkOrder(data);
            }
            setShowModal(false);
            resetForm();
            fetchOrders();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            try {
                await deleteBulkOrder(id);
                fetchOrders();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const handlePayment = async (order) => {
        const amount = prompt(`Enter payment amount (Pending: ₹${order.pendingAmount}):`, order.pendingAmount);
        if (amount !== null) {
            try {
                await recordPayment(order._id, parseFloat(amount));
                fetchOrders();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            customerName: '',
            phone: '',
            address: '',
            eventType: 'wedding',
            quantity: 1,
            bottleType: '20L',
            pricePerBottle: 45,
            deliveryDates: [''],
            notes: ''
        });
        setEditingOrder(null);
    };

    const handleEdit = (order) => {
        setEditingOrder(order);
        setFormData({
            customerName: order.customerName,
            phone: order.phone,
            address: order.address,
            eventType: order.eventType,
            quantity: order.quantity,
            bottleType: order.bottleType,
            pricePerBottle: order.pricePerBottle,
            deliveryDates: order.deliveryDates.map(d => new Date(d).toISOString().split('T')[0]),
            notes: order.notes || ''
        });
        setShowModal(true);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <Navbar />
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>📦 Bulk Orders</h1>
                        <p>Manage event and bulk water orders</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                        + Add Bulk Order
                    </button>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Event Type</th>
                                <th>Quantity</th>
                                <th>Total Amount</th>
                                <th>Paid</th>
                                <th>Pending</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id}>
                                    <td>
                                        <div className="font-semibold">{order.customerName}</div>
                                        <div className="text-sm text-secondary">{order.phone}</div>
                                    </td>
                                    <td><span className="badge badge-primary">{order.eventType}</span></td>
                                    <td>{order.quantity} × {order.bottleType}</td>
                                    <td className="font-bold">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                                    <td className="text-success">₹{order.paidAmount.toLocaleString('en-IN')}</td>
                                    <td className="text-danger">₹{order.pendingAmount.toLocaleString('en-IN')}</td>
                                    <td>
                                        <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' :
                                                order.paymentStatus === 'partial' ? 'badge-warning' : 'badge-danger'
                                            }`}>
                                            {order.paymentStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-sm">
                                            <button className="btn btn-sm btn-success" onClick={() => handlePayment(order)}>
                                                Pay
                                            </button>
                                            <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(order)}>
                                                Edit
                                            </button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(order._id)}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Modal
                    isOpen={showModal}
                    onClose={() => { setShowModal(false); resetForm(); }}
                    title={editingOrder ? 'Edit Bulk Order' : 'Add New Bulk Order'}
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSubmit}>
                                {editingOrder ? 'Update' : 'Create'}
                            </button>
                        </>
                    }
                >
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Customer Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
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
                            <label className="form-label">Event Type *</label>
                            <select
                                className="form-select"
                                value={formData.eventType}
                                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                            >
                                <option value="wedding">Wedding</option>
                                <option value="festival">Festival</option>
                                <option value="corporate">Corporate</option>
                                <option value="party">Party</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Quantity *</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                min="1"
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
                            <label className="form-label">Delivery Date *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.deliveryDates[0]}
                                onChange={(e) => setFormData({ ...formData, deliveryDates: [e.target.value] })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Notes</label>
                            <textarea
                                className="form-textarea"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default BulkOrders;
