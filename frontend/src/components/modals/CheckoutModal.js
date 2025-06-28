import React from 'react';

const CheckoutModal = ({ show, total, address, onClose, onConfirm }) => {
  const [paymentMethod, setPaymentMethod] = React.useState('Cash on Delivery');

  if (!show) return null;
  return (
    <div className="modal d-block show" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirm Your Order</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p className="text-primary fs-3 fw-bold text-center mb-4">Total: <span>${total.toFixed(2)}</span></p>
            <div className="mb-3">
              <label className="form-label fw-semibold">Payment Method:</label>
              <select className="form-select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} required>
                <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                <option value="Credit Card">Credit Card</option>
                <option value="PayPal">PayPal</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Shipping Address:</label>
              <input type="text" className="form-control" value={address} readOnly />
              <div className="form-text">This is your registered address. Update it in your profile if needed.</div>
            </div>
            <button type="button" className="btn btn-success btn-lg w-100 mt-3" onClick={() => onConfirm(paymentMethod)}>Confirm Order</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
