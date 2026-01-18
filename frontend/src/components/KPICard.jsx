import React from 'react';
import './KPICard.css';

const KPICard = ({ title, value, icon, trend, color = 'primary' }) => {
    return (
        <div className={`kpi-card kpi-card-${color}`}>
            <div className="kpi-icon">{icon}</div>
            <div className="kpi-content">
                <h4 className="kpi-title">{title}</h4>
                <div className="kpi-value">₹{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</div>
                {trend && (
                    <div className={`kpi-trend ${trend > 0 ? 'positive' : 'negative'}`}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </div>
                )}
            </div>
        </div>
    );
};

export default KPICard;
