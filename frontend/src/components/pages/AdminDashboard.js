import React, { useState } from 'react';

const dummyProducts = [
  // Example: { _id: '1', name: 'Apple', price: 1.99, stock: 100 }
];

const AdminDashboard = ({ users = [], orders = [], feedback = [], products = dummyProducts, onAddProduct, onEditProduct, onDeleteProduct, onEditUser, onDeleteUser, onEditOrder, onDeleteOrder, onDeleteFeedback, onUpdateOrderStatus }) => {
  const [section, setSection] = useState('products');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', image: '', description: '' });
  const [editProduct, setEditProduct] = useState(null);
  // Confirmation modal state
  const [confirm, setConfirm] = useState({ show: false, type: '', id: null });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (onAddProduct) await onAddProduct(newProduct);
    setShowAddModal(false);
    setNewProduct({ name: '', price: '', stock: '', image: '', description: '' });
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (onEditProduct) await onEditProduct(editProduct);
    setEditProduct(null);
  };

  const handleDeleteProduct = async (prodId) => {
    if (window.confirm('Delete this product?')) {
      if (onDeleteProduct) await onDeleteProduct(prodId);
    }
  };

  // User actions
  const handleRoleChange = async (userId, newRole) => {
    if (onEditUser) await onEditUser(userId, newRole);
  };
  const handleDeleteUser = (userId) => {
    setConfirm({ show: true, type: 'user', id: userId });
  };
  // Order actions
  const handleDeleteOrder = (orderId) => {
    setConfirm({ show: true, type: 'order', id: orderId });
  };
  // Feedback actions
  const handleDeleteFeedback = (feedbackId) => {
    setConfirm({ show: true, type: 'feedback', id: feedbackId });
  };

  const handleConfirmDelete = async () => {
    if (confirm.type === 'user' && onDeleteUser) {
      await onDeleteUser(confirm.id);
    } else if (confirm.type === 'feedback' && onDeleteFeedback) {
      await onDeleteFeedback(confirm.id);
    } else if (confirm.type === 'order' && onDeleteOrder) {
      await onDeleteOrder(confirm.id);
    }
    setConfirm({ show: false, type: '', id: null });
  };

  const handleCancelDelete = () => {
    setConfirm({ show: false, type: '', id: null });
  };

  return (
    <section className="page-section bg-white p-4 rounded-3 shadow-sm mx-auto mb-4" style={{ maxWidth: 1000 }}>
      <h2 className="fs-2 fw-bold text-dark text-center mb-4">Admin Dashboard</h2>
      <div className="d-flex justify-content-center gap-3 mb-4">
        <button className={`btn btn-lg ${section === 'products' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSection('products')}>Manage Products</button>
        <button className={`btn btn-lg ${section === 'users' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSection('users')}>Manage Users</button>
        <button className={`btn btn-lg ${section === 'orders' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSection('orders')}>Manage Orders</button>
        <button className={`btn btn-lg ${section === 'feedback' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSection('feedback')}>View Feedback</button>
      </div>
      <div>
        {section === 'products' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Products</h4>
              <button className="btn btn-success" onClick={() => setShowAddModal(true)}>Add New Product</button>
            </div>
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Description</th>
                    <th>Image</th>
                    <th>Actions</th>
                    
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan="6" className="text-center">No products found.</td></tr>
                  ) : (
                    products.map(prod => (
                      <tr key={prod._id}>
                        <td>{prod.name}</td>
                        <td>{prod.category || 'N/A'}</td>
                        <td>${prod.price?.toFixed(2) ?? ''}</td>
                        <td>{prod.stock}</td>
                        <td>{prod.description}</td>
                        <td><img src={prod.image ? prod.image : 'https://placehold.co/60x40?text=No+Image'} alt={prod.name} style={{ width: 60, height: 40, objectFit: 'cover' }} /></td>
                        <td>
                          <button className="btn btn-sm btn-warning me-2" onClick={() => setEditProduct(prod)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteProduct(prod._id)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Add Product Modal */}
            {showAddModal && (
              <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Add New Product</h5>
                      <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                    </div>
                    <form onSubmit={handleAddProduct}>
                      <div className="modal-body">
                        <div className="mb-2">
                          <label className="form-label">Name</label>
                          <input className="form-control" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Category</label>
                          <input className="form-control" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} required />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Price</label>
                          <input type="number" step="0.01" className="form-control" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Stock</label>
                          <input type="number" className="form-control" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} required />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Image URL</label>
                          <input className="form-control" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Description</label>
                          <textarea className="form-control" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-success">Add Product</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
            {/* Edit Product Modal */}
            {editProduct && (
              <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Edit Product</h5>
                      <button type="button" className="btn-close" onClick={() => setEditProduct(null)}></button>
                    </div>
                    <form onSubmit={handleEditProduct}>
                      <div className="modal-body">
                        <div className="mb-2">
                          <label className="form-label">Name</label>
                          <input className="form-control" value={editProduct.name} onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} required />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Price</label>
                          <input type="number" step="0.01" className="form-control" value={editProduct.price} onChange={e => setEditProduct({ ...editProduct, price: e.target.value })} required />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Stock</label>
                          <input type="number" className="form-control" value={editProduct.stock} onChange={e => setEditProduct({ ...editProduct, stock: e.target.value })} required />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Image URL</label>
                          <input className="form-control" value={editProduct.image} onChange={e => setEditProduct({ ...editProduct, image: e.target.value })} />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Description</label>
                          <textarea className="form-control" value={editProduct.description} onChange={e => setEditProduct({ ...editProduct, description: e.target.value })} />
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setEditProduct(null)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {section === 'users' && (
          <div>
            <h4>Users</h4>
            <ul className="list-group">
              {users.length === 0 ? (
                <li className="list-group-item">No users found.</li>
              ) : (
                users.map(u => (
                  <li key={u._id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>
                        <b>{u.name}</b> ({u.email})
                        <span className="ms-2">
                          <select className="form-select form-select-sm d-inline-block w-auto" value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </span><br/>
                        <span className="text-secondary small">Address: {u.address || 'N/A'} | Phone: {u.phone || 'N/A'}</span><br/>
                        <span className="text-secondary small">
                          Cart: {u.cart?.items?.length ?? 0} | Wishlist: {u.wishlist?.items?.length ?? 0} | Feedback: {u.feedback?.length ?? 0}
                        </span>
                      </span>
                      <span>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteUser(u._id)}>Delete</button>
                      </span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
        {section === 'orders' && (
          <div>
            <h4>Orders</h4>
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th scope="col">Order ID</th>
                    <th scope="col">User Details</th>
                    <th scope="col">Items</th>
                    <th scope="col">Total</th>
                    <th scope="col">Payment</th>
                    <th scope="col">Address</th>
                    <th scope="col">Status</th>
                    <th scope="col">Ordered On</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan="9" className="text-center">No orders found.</td></tr>
                  ) : (
                    orders.map(order => {
                      const user = order.user || order.userId || {};
                      const items = order.items || [];
                      return (
                        <tr key={order._id}>
                          <td>{order._id?.substring(0, 8)}...</td>
                          <td>
                            Name: {user.name || 'N/A'}<br/>
                            Email: {user.email || 'N/A'}<br/>
                            Phone: {user.phone || 'N/A'}
                          </td>
                          <td>
                            <ul className="list-unstyled mb-0">
                              {items.map((item, idx) => (
                                <li key={idx}>
                                  {(item.product?.name || item.name || 'Product')} (x{item.quantity}) - ${item.price?.toFixed(2) ?? ''}
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td>${order.total?.toFixed(2) ?? '0.00'}</td>
                          <td>{order.paymentMethod || 'N/A'}</td>
                          <td>{order.shippingAddress || 'N/A'}</td>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              style={{ minWidth: 110 }}
                              value={order.status}
                              onChange={e => onUpdateOrderStatus && onUpdateOrderStatus(order._id, e.target.value)}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</td>
                          <td>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDeleteOrder(order._id)}>Delete</button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {section === 'feedback' && (
          <div>
            <h4>Feedback</h4>
            <ul className="list-group">
              {feedback.length === 0 ? (
                <li className="list-group-item">No feedback found.</li>
              ) : (
                feedback.map(f => (
                  <li key={f._id} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>
                      <b>{f.product?.name || 'Product'}</b> - {f.rating}★<br />
                      <span className="text-muted small">{f.comment}</span><br />
                      <span className="text-secondary small">By: {f.user?.name || 'User'} | {f.createdAt ? new Date(f.createdAt).toLocaleString() : ''}</span>
                    </span>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteFeedback(f._id)}>Delete</button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
      {/* Confirmation Modal */}
      {confirm.show && (
        <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={handleCancelDelete}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this {confirm.type === 'user' ? 'user' : confirm.type === 'order' ? 'order' : 'feedback'}?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCancelDelete}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminDashboard;
