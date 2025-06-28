import React from 'react';

const FeedbackModal = ({ show, productName, rating, comment, onRatingChange, onCommentChange, onClose, onSubmit }) => {
  if (!show) return null;
  // Check if FontAwesome is loaded
  const faLoaded = typeof window !== 'undefined' && document.querySelector('link[href*="font-awesome"]');
  return (
    <div className="modal d-block show" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Provide Feedback for <span>{productName}</span></h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {!faLoaded && (
              <div className="alert alert-warning p-2 text-center">FontAwesome not loaded! Please check your index.html.</div>
            )}
            <form onSubmit={onSubmit}>
              <div className="mb-3 text-center">
                <label className="form-label fw-semibold">Rating:</label>
                <div className="rating-stars">
                  {[1,2,3,4,5].map(star => (
                    <i
                      key={star}
                      className={`fa${rating >= star ? '-solid' : '-regular'} fa-star star${rating >= star ? ' selected' : ''}`}
                      data-rating={star}
                      style={{ cursor: 'pointer', color: rating >= star ? '#ffc107' : '#ddd', fontSize: '2rem', margin: '0 2px' }}
                      onClick={() => onRatingChange(star)}
                    ></i>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Comment:</label>
                <textarea className="form-control" rows="4" placeholder="Share your experience..." value={comment} onChange={e => onCommentChange(e.target.value)}></textarea>
              </div>
              <div className="d-grid">
                <button type="submit" className="btn btn-primary btn-lg">Submit Feedback</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
