import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <span className="brand-icon">💧</span>
                    <span className="brand-text">Water Delivery</span>
                </div>

                <div className="navbar-menu">
                    <Link
                        to="/dashboard"
                        className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                    >
                        📊 Dashboard
                    </Link>
                    <Link
                        to="/customers"
                        className={`nav-link ${isActive('/customers') ? 'active' : ''}`}
                    >
                        👥 Customers
                    </Link>
                    <Link
                        to="/bulk-orders"
                        className={`nav-link ${isActive('/bulk-orders') ? 'active' : ''}`}
                    >
                        📦 Bulk Orders
                    </Link>
                    <Link
                        to="/reports"
                        className={`nav-link ${isActive('/reports') ? 'active' : ''}`}
                    >
                        📈 Reports
                    </Link>
                </div>

                <div className="navbar-user">
                    <div className="user-info">
                        <span className="user-name">{user?.name}</span>
                        <span className="user-role">{user?.role}</span>
                    </div>
                    <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
