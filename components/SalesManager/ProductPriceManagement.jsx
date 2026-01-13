import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productManagerAPI } from '../api';
import './SalesDashboard.css'; // Reuse existing styles or add specific ones

function ProductPriceManagement() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updateStatus, setUpdateStatus] = useState({ id: null, type: '', message: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productManagerAPI.getManagerProducts();
            setProducts(response.data.products || []);
            setError('');
        } catch (err) {
            setError('Failed to load products');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePriceUpdate = async (product) => {
        try {
            setUpdateStatus({ id: product.id, type: 'info', message: 'Updating...' });

            // Call API to update product
            await productManagerAPI.updateProduct(product.id, {
                price: product.price
            });

            setUpdateStatus({ id: product.id, type: 'success', message: 'Price updated!' });

            // Create a temporary flash message that clears after 3 seconds
            setTimeout(() => {
                setUpdateStatus({ id: null, type: '', message: '' });
            }, 3000);

        } catch (err) {
            console.error('Error updating price:', err);
            setUpdateStatus({
                id: product.id,
                type: 'error',
                message: err.message || 'Update failed'
            });
        }
    };

    const handeInputChange = (id, value) => {
        setProducts(products.map(p =>
            p.id === id ? { ...p, price: value } : p
        ));
    };

    if (loading) return <div className="sales-dashboard-loading">Loading products...</div>;

    return (
        <div className="sales-dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <button
                    onClick={() => navigate('/sales-manager')}
                    className="sales-action-btn"
                    style={{ background: '#6b7280', padding: '8px 16px' }}
                >
                    ← Back to Dashboard
                </button>
                <h1 className="sales-dashboard-title" style={{ margin: 0 }}>Product Price Management</h1>
                <div style={{ width: '100px' }}></div> {/* Spacer for centering */}
            </div>

            {error && <div className="sales-dashboard-error">{error}</div>}

            <div className="sales-quick-actions" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                            <th style={{ padding: '12px', textAlign: 'left', color: '#374151' }}>Product Name</th>
                            <th style={{ padding: '12px', textAlign: 'left', color: '#374151' }}>Model / SKU</th>
                            <th style={{ padding: '12px', textAlign: 'left', color: '#374151' }}>Stock</th>
                            <th style={{ padding: '12px', textAlign: 'left', color: '#374151' }}>Price (TL)</th>
                            <th style={{ padding: '12px', textAlign: 'left', color: '#374151' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '16px 12px' }}>
                                    <div style={{ fontWeight: '600', color: '#111827' }}>{product.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Category: {product.category}</div>
                                </td>
                                <td style={{ padding: '16px 12px', color: '#4b5563' }}>
                                    {product.model}
                                </td>
                                <td style={{ padding: '16px 12px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: product.quantity_in_stock < 10 ? '#fee2e2' : '#d1fae5',
                                        color: product.quantity_in_stock < 10 ? '#991b1b' : '#065f46',
                                        fontSize: '0.9rem'
                                    }}>
                                        {product.quantity_in_stock}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 12px' }}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={product.price}
                                        onChange={(e) => handeInputChange(product.id, e.target.value)}
                                        style={{
                                            padding: '8px',
                                            borderRadius: '6px',
                                            border: '1px solid #d1d5db',
                                            width: '120px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </td>
                                <td style={{ padding: '16px 12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <button
                                            onClick={() => handlePriceUpdate(product)}
                                            className="sales-action-btn"
                                            style={{
                                                padding: '8px 16px',
                                                fontSize: '0.9rem',
                                                background: '#10b981'
                                            }}
                                        >
                                            Update
                                        </button>
                                        {updateStatus.id === product.id && (
                                            <span style={{
                                                fontSize: '0.85rem',
                                                color: updateStatus.type === 'error' ? '#ef4444' : '#059669',
                                                fontWeight: '500'
                                            }}>
                                                {updateStatus.message}
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {products.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                        No products found.
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductPriceManagement;
