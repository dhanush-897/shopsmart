import React from 'react';

const OrderHistory = ({ orders }) => (
  <section className="page-section bg-white p-4 rounded-3 shadow-sm mx-auto mb-4" style={{ maxWidth: 900 }}>
    <h2 className="fs-2 fw-bold text-dark text-center mb-4">My Orders</h2>
    {orders.length === 0 ? (
      <p className="text-center text-secondary fs-5">You have no past orders.</p>
    ) : (
      <div className="d-flex flex-column gap-4">
        {orders.map(order => (
          <div key={order._id} className="card">
            <div className="card-body">
              <h5 className="card-title">Order #{order._id}</h5>
              <p className="card-text">Total: {typeof order.total === 'number' ? order.total.toFixed(2) : '0.00'}</p>
              <p className="card-text">Status: {order.status}</p>
              <div className="mb-2">
                <strong>Products:</strong>
                <ul className="list-unstyled ms-2">
                  {order.items && order.items.map((item, idx) => (
                    <li key={item._id || idx} className="d-flex align-items-center mb-2">
                      {item.product && item.product.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4, marginRight: 12 }}
                        />
                      )}
                      <div>
                        <div><strong>{item.product?.name || 'Product'}</strong></div>
                        <div className="text-muted small">Qty: {item.quantity} &nbsp;|&nbsp; Price: ${item.price?.toFixed(2)}</div>
                        {item.product?.description && (
                          <div className="text-muted small">{item.product.description.slice(0, 60)}{item.product.description.length > 60 ? '...' : ''}</div>
                        )}
                        {item.product?.category && (
                          <div className="text-muted small">Category: {item.product.category}</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

export default OrderHistory;
