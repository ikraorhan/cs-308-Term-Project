import React, { useState, useEffect } from 'react';
import { salesManagerAPI, productManagerAPI } from '../api';

const Campaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discount_percentage: 10,
        start_date: '',
        end_date: '',
        product_ids: []
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [campRes, prodRes] = await Promise.all([
                salesManagerAPI.getCampaigns(),
                productManagerAPI.getManagerProducts()
            ]);
            setCampaigns(campRes.data);
            if (prodRes.data && prodRes.data.products) {
                setProducts(prodRes.data.products);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await salesManagerAPI.createCampaign(formData);
            setShowForm(false);
            setFormData({
                title: '',
                description: '',
                discount_percentage: 10,
                start_date: '',
                end_date: '',
                product_ids: []
            });
            loadData();
        } catch (err) {
            alert('Error creating campaign');
        }
    };

    const handleProductSelect = (e) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selected.push(parseInt(options[i].value));
            }
        }
        setFormData({ ...formData, product_ids: selected });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="section-title">Promotions & Campaigns</h2>
                <button className="action-btn btn-primary" onClick={() => setShowForm(true)}>New Campaign</button>
            </div>

            {showForm && (
                <div className="chart-container" style={{ height: 'auto' }}>
                    <h3>Create Campaign</h3>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label>Title:</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            />
                        </div>
                        <div>
                            <label>Description:</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <label>Start Date:</label>
                                <input
                                    type="datetime-local"
                                    value={formData.start_date}
                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label>End Date:</label>
                                <input
                                    type="datetime-local"
                                    value={formData.end_date}
                                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label>Discount (%):</label>
                            <input
                                type="number"
                                min="1" max="100"
                                value={formData.discount_percentage}
                                onChange={e => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) })}
                                required
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            />
                        </div>
                        <div>
                            <label>Select Products (Hold Ctrl/Cmd to select multiple):</label>
                            <select
                                multiple
                                value={formData.product_ids}
                                onChange={handleProductSelect}
                                style={{ width: '100%', padding: '8px', marginTop: '5px', height: '150px' }}
                            >
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <button type="submit" className="action-btn btn-primary">Create Campaign</button>
                            <button type="button" className="action-btn" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="stats-grid">
                {campaigns.map(c => (
                    <div key={c.id} className="stat-card" style={{ borderLeft: `4px solid ${c.status === 'active' ? 'green' : 'gray'}` }}>
                        <h3>{c.title}</h3>
                        <div style={{ color: '#666', marginBottom: '10px' }}>{c.description}</div>
                        <div className="stat-value" style={{ fontSize: '20px' }}>{c.discount_percentage}% OFF</div>
                        <div style={{ fontSize: '12px', marginTop: '10px' }}>
                            <div>Start: {new Date(c.start_date).toLocaleString()}</div>
                            <div>End: {new Date(c.end_date).toLocaleString()}</div>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <span style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                background: c.status === 'active' ? '#e6f4ea' : '#f1f3f4',
                                color: c.status === 'active' ? 'green' : 'gray',
                                fontSize: '12px'
                            }}>
                                {c.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                ))}
                {campaigns.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center' }}>No campaigns found. Create one!</div>}
            </div>
        </div>
    );
};

export default Campaigns;
