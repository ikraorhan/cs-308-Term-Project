import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Prices from './Prices';
import Campaigns from './Campaigns';
import './SalesManager.css';
import { checkAuth } from '../api';

const SalesManager = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyAuth = async () => {
            const user = await checkAuth();
            if (!user) {
                navigate('/login');
                return;
            }
            // Optional: Strict role check
            setIsAuthenticated(true);
            setIsLoading(false);
        };
        verifyAuth();
    }, [navigate]);

    if (isLoading) return <div>Loading...</div>;

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard />;
            case 'prices':
                return <Prices />;
            case 'campaigns':
                return <Campaigns />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="sales-manager-container">
            <div className="sales-sidebar">
                <div
                    className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    Dashboard
                </div>
                <div
                    className={`sidebar-item ${activeTab === 'prices' ? 'active' : ''}`}
                    onClick={() => setActiveTab('prices')}
                >
                    Price Management
                </div>
                <div
                    className={`sidebar-item ${activeTab === 'campaigns' ? 'active' : ''}`}
                    onClick={() => setActiveTab('campaigns')}
                >
                    Campaigns
                </div>
            </div>
            <div className="sales-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default SalesManager;
