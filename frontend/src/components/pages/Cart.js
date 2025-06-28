import React, { useState } from 'react';

const Cart = ({ cart, onRemove, onUpdateQuantity, onCheckout }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('COD');
  const items = cart && Array.isArray(cart.items) ? cart.items : [];

  const handleQuantityChange = (itemId, newQty) => {
    if (newQty < 1) return;
    // Find the correct productId for backend
    const item = items.find(i => i._id === itemId || i.productId === itemId || (i.productId && i.productId._id === itemId));
    const productId = item?.productId?._id || item?.productId || item?._id || itemId;
    onUpdateQuantity(productId, newQty);
  };

  const handleProceedToCheckout = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSelect = (e) => {
    setSelectedPayment(e.target.value);
  };

  const handleConfirmCheckout = () => {
    setShowPaymentModal(false);
    setShowConfirmModal(true);
  };

  const handleFinalConfirm = () => {
    setShowConfirmModal(false);
    onCheckout(selectedPayment);
  };

  // Grand total for cart
  const grandTotal = items.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : (item.productId?.price || 0);
    return sum + price * (item.quantity || 0);
  }, 0);

  return (
    <section className="page-section bg-white p-4 rounded-3 shadow-sm mx-auto mb-4" style={{ maxWidth: 700 }}>
      <h2 className="fs-2 fw-bold text-dark text-center mb-4">Your Shopping Cart</h2>
      <div className="d-flex flex-column gap-3">
        {(!items || items.length === 0) ? (
          <p className="text-center text-secondary fs-5">Your cart is empty.</p>
        ) : (
          items.map(item => (
            <div key={item._id || item.productId?._id || item.productId} className="card mb-2">
              <div className="card-body d-flex justify-content-between align-items-center">
                <span>{item.name || item.productId?.name}</span>
                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => handleQuantityChange(item._id || item.productId?._id || item.productId, item.quantity - 1)}>-</button>
                  <input type="number" min="1" value={item.quantity} onChange={e => handleQuantityChange(item._id || item.productId?._id || item.productId, parseInt(e.target.value) || 1)} style={{ width: 50, textAlign: 'center' }} />
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => handleQuantityChange(item._id || item.productId?._id || item.productId, item.quantity + 1)}>+</button>
                </div>
                <span className="fw-bold">${((item.price ?? item.productId?.price) * item.quantity)?.toFixed(2) ?? '0.00'}</span>
              </div>
              <div className="card-footer text-end">
                <button className="btn btn-danger btn-sm" onClick={() => onRemove(item.productId?._id || item.productId || item._id)}>Remove</button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 pt-3 border-top border-2 border-light">
        <div className="d-flex justify-content-between align-items-center fs-4 fw-bold text-dark">
          <span>Total:</span>
          <span>{grandTotal.toFixed(2)}</span>
        </div>
        <button className="btn btn-primary btn-lg w-100 mt-4 shadow-sm" onClick={handleProceedToCheckout} disabled={items.length === 0}>Proceed to Checkout</button>
      </div>

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Select Payment Method</h5>
                <button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)}></button>
              </div>
              <div className="modal-body">
                <select className="form-select" value={selectedPayment} onChange={handlePaymentSelect}>
                  <option value="COD">Cash on Delivery</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Card">Credit/Debit Card</option>
                </select>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleConfirmCheckout}>Continue</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Order</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Payment Method: <strong>{selectedPayment}</strong></p>
                <p>Total: <strong>${grandTotal.toFixed(2)}</strong></p>
                <p>Are you sure you want to place this order?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                <button className="btn btn-success" onClick={handleFinalConfirm}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Cart;
