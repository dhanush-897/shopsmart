import React from 'react';

const ConfirmationModal = ({ show, message, onConfirm, onCancel }) => {
  if (!show) return null;
  return (
    <div className="modal d-block show" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-body text-center">
            <p className="mb-4 fs-5 fw-semibold text-dark">{message}</p>
            <div className="d-flex justify-content-around mt-3">
              <button type="button" className="btn btn-danger px-4 py-2 rounded-pill" onClick={onConfirm}>Yes</button>
              <button type="button" className="btn btn-secondary px-4 py-2 rounded-pill" onClick={onCancel}>No</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
