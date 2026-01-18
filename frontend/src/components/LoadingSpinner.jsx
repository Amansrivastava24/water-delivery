import React from 'react';

const LoadingSpinner = ({ size = 'medium' }) => {
    const sizeMap = {
        small: '24px',
        medium: '40px',
        large: '60px'
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem'
        }}>
            <div
                className="spinner"
                style={{
                    width: sizeMap[size],
                    height: sizeMap[size]
                }}
            ></div>
        </div>
    );
};

export default LoadingSpinner;
