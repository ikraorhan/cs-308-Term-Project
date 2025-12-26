import React, { useState, useEffect } from 'react';
import { productManagerAPI, salesManagerAPI } from '../api';

const Prices = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editPrice, setEditPrice] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            // Re-using product manager API to get list of products
            const response = await productManagerAPI.getManagerProducts();
            if (response.data && response.data.products) {
                setProducts(response.data.products);
            }
        } catch (err) {
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (product) => {
        setEditingId(product.id);
        setEditPrice(product.price);
        setError('');
        setSuccess('');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditPrice('');
    };

    const handleSavePrice = async (id) => {
        try {
            await salesManagerAPI.updateProductPrice(id, parseFloat(editPrice));
            setSuccess('Price updated successfully');
            setEditingId(null);
            loadProducts(); // Reload to see changes
        } catch (err) {
            setError('Failed to update price');
        }
    };

    if (loading) return <div>Loading products...</div>;

    return (
        <div>
            <h2 className="section-title">Price Management</h2>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Model</th>
                        <th>Stock</th>
                        <th>Cost</th>
                        <th>Current Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.model}</td>
                            <td>{product.quantity_in_stock}</td>
                            <td>${product.cost || '-'}</td>
                            <td>
                                {editingId === product.id ? (
                                    <input
                                        type="number"
                                        value={editPrice}
                                        onChange={(e) => setEditPrice(e.target.value)}
                                        step="0.01"
                                        style={{ padding: '5px', width: '100px' }}
                                    />
                                ) : (
                                    `$${product.price}`
                                )}
                            </td>
                            <td>
                                {editingId === product.id ? (
                                    <>
                                        <button className="action-btn btn-primary" onClick={() => handleSavePrice(product.id)}>Save</button>
                                        <button className="action-btn" onClick={handleCancelEdit}>Cancel</button>
                                    </>
                                ) : (
                                    <button className="action-btn btn-primary" onClick={() => handleEditClick(product)}>Edit Price</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Prices;
