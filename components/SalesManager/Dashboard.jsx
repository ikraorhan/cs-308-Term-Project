import React, { useEffect, useState } from 'react';
import { salesManagerAPI } from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await salesManagerAPI.getDashboardStats();
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;
    if (!stats) return <div>Error loading stats.</div>;

    return (
        <div>
            <h2 className="section-title">Business Intelligence Dashboard</h2>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Revenue</div>
                    <div className="stat-value">${Number(stats.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Orders</div>
                    <div className="stat-value">{stats.total_orders}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Active Campaigns</div>
                    <div className="stat-value">{stats.active_campaigns}</div>
                </div>
            </div>

            <div className="chart-container">
                <h3>Revenue Last 30 Days</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.revenue_chart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value}`} />
                        <Line type="monotone" dataKey="revenue" stroke="#4a90e2" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-container" style={{ height: 'auto' }}>
                <h3>Top Selling Products</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Units Sold</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.top_products.map((p, i) => (
                            <tr key={i}>
                                <td>{p.product_name}</td>
                                <td>{p.total_quantity}</td>
                                <td>${Number(p.total_revenue).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
