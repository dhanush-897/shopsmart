import React from 'react';

const Wishlist = ({ wishlist = { items: [] }, onAddToCart, onRemove }) => (
  <section className="page-section bg-white p-4 rounded-3 shadow-sm mb-4">
    <h2 className="display-4 fw-bold text-dark text-center mb-4">Your Wishlist</h2>
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
      {(!wishlist.items || wishlist.items.length === 0) ? (
        <p className="col-12 text-center text-secondary fs-5">Your wishlist is empty. Add some products!</p>
      ) : (
        wishlist.items.map(item => (
          <div key={item.productId?._id || item.productId || item._id} className="col">
            <div className="card wishlist-card h-100 d-flex flex-column">
              <div className="d-flex flex-column align-items-center p-2" style={{ minHeight: 220 }}>
                <img src={(item.productId?.image || item.image) || 'https://placehold.co/300x200/cccccc/333333?text=No+Image'} alt={item.productId?.name || item.name} className="card-img-top mb-2" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8 }} />
                <h5 className="card-title fw-bold text-center mt-2">{item.productId?.name || item.name}</h5>
                <p className="card-text text-muted text-center small">{item.productId?.description || item.description}</p>
              </div>
              <div className="mt-auto d-flex justify-content-center gap-2 pb-3">
                <button className="btn btn-primary btn-sm" onClick={() => onAddToCart(item.productId?._id || item._id)}>Add to Cart</button>
                <button className="btn btn-outline-danger btn-sm" onClick={() => onRemove(item.productId?._id || item._id)}>Remove</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </section>
);

export default Wishlist;
