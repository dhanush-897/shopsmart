import React from 'react';

const ProductCard = ({ product, onProductClick, onAddToCart, onAddToWishlist, onFeedback }) => (
  <div className="col">
    <div className="card product-card h-100 d-flex flex-column">
      <div style={{ cursor: 'pointer' }} onClick={() => onProductClick(product._id)}>
        <img src={product.image || 'https://placehold.co/300x200/cccccc/333333?text=No+Image'} alt={product.name} className="card-img-top" />
        <div className="card-body d-flex flex-column align-items-center">
          <h5 className="card-title fw-bold text-center">{product.name}</h5>
          <p className="card-text text-muted text-center small">{product.description}</p>
        </div>
      </div>
      <div className="product-price-and-buttons mt-auto w-100 px-3 pb-3">
        <span className="price text-primary fw-bold fs-5">${product.price.toFixed(2)}</span>
        <div className="card-actions mt-2 d-flex justify-content-center gap-2">
          <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); onAddToCart(product._id); }}>Add to Cart</button>
          <button className="btn btn-outline-danger btn-sm" onClick={e => { e.stopPropagation(); onAddToWishlist(product._id); }}>Wishlist</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={e => { e.stopPropagation(); onFeedback(product); }}>Feedback</button>
        </div>
      </div>
    </div>
  </div>
);

export default ProductCard;
