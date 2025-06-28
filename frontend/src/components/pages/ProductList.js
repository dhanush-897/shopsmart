import React from 'react';
import ProductCard from '../ui/ProductCard';

const ProductList = ({ products, onProductClick, onAddToCart, onAddToWishlist, onFeedback }) => (
  <section className="page-section bg-white p-4 rounded-3 shadow-sm mb-4">
    <h2 className="display-4 fw-bold text-dark text-center mb-4">Our Products</h2>
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4" id="product-list">
      {products.length === 0 ? (
        <p className="col-12 text-center text-secondary fs-5">No products available. Please check back later or add some as an admin!</p>
      ) : (
        products.map(product => (
          <ProductCard
            key={product._id}
            product={product}
            onProductClick={onProductClick}
            onAddToCart={onAddToCart}
            onAddToWishlist={onAddToWishlist}
            onFeedback={onFeedback}
          />
        ))
      )}
    </div>
  </section>
);

export default ProductList;
