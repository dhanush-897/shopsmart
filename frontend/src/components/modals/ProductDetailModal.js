import React from 'react';

const ProductDetailModal = ({ show, product, onClose, onAddToCart, onGenerateInsights, insights }) => {
  if (!show || !product) return null;
  return (
    <div className="modal d-block show" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Product Details</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-6">
                <img src={product.image || 'https://placehold.co/300x200/cccccc/333333?text=No+Image'} alt="Product" className="img-fluid rounded mb-3" />
              </div>
              <div className="col-md-6">
                <h3 className="fs-2 fw-bold text-dark mb-2">{product.name}</h3>
                <p className="text-muted mb-3">{product.description}</p>
                <p className="text-secondary mb-1"><strong>Category:</strong> {product.category || 'N/A'}</p>
                <p className="text-secondary mb-1"><strong>Available Stock:</strong> {product.stock ?? 'N/A'}</p>
                <p className="text-secondary mb-1"><strong>Weight:</strong> {product.weight ? `${product.weight} kg` : 'N/A'}</p>
                <p className="text-secondary mb-1"><strong>Dimensions:</strong> {product.dimensions || 'N/A'}</p>
                <p className="text-primary fs-3 fw-bold mt-auto">${product.price.toFixed(2)}</p>
                <button className="btn btn-purple btn-lg w-100 mt-3" onClick={onGenerateInsights}>
                  ✨ Generate Product Insights
                </button>
                {insights && (
                  <div className="mt-3 p-3 bg-light rounded-3 text-dark">
                    <p className="fw-semibold mb-2">AI-Generated Insights:</p>
                    <p>{insights}</p>
                  </div>
                )}
                <button className="btn btn-primary btn-lg w-100 mt-3" onClick={onAddToCart}>Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
