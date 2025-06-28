import React from 'react';

const Header = ({ user, cartCount = 0, wishlistCount = 0, onNav, onProfile, onLogout }) => (
  <header className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
    <div className="container-fluid container">
      <h1 className="navbar-brand mb-0 h1 bg-dark bg-opacity-75 px-3 py-1 rounded">
        <span className="text-white text-decoration-none" style={{ cursor: 'pointer' }} onClick={() => onNav('products')}>ShopSmart</span>
      </h1>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul className="navbar-nav align-items-center">
          <li className="nav-item">
            <span className="nav-link text-white fs-5 fw-medium" style={{ cursor: 'pointer' }} onClick={() => onNav('products')}>Products</span>
          </li>
          {user && user.role !== 'admin' && (
            <li className="nav-item">
              <span className="nav-link text-white fs-5 fw-medium position-relative" style={{ cursor: 'pointer' }} onClick={() => onNav('cart')}>
                Cart
                {/* Remove badge/dot for cart */}
              </span>
            </li>
          )}
          {user && user.role !== 'admin' && (
            <li className="nav-item">
              <span className="nav-link text-white fs-5 fw-medium position-relative" style={{ cursor: 'pointer' }} onClick={() => onNav('wishlist')}>
                Wishlist
                {/* Remove badge/dot for wishlist */}
              </span>
            </li>
          )}
          {user && user.role === 'admin' && (
            <li className="nav-item">
              <span className="nav-link text-white fs-5 fw-medium" style={{ cursor: 'pointer' }} onClick={() => onNav('admin')}>Admin</span>
            </li>
          )}
          {user && user.role !== 'admin' && (
            <li className="nav-item">
              <span className="nav-link text-white fs-5 fw-medium" style={{ cursor: 'pointer' }} onClick={() => onNav('orders')}>My Orders</span>
            </li>
          )}
          {!user && (
            <>
              <li className="nav-item">
                <span className="nav-link text-white fs-5 fw-medium" style={{ cursor: 'pointer' }} onClick={() => onNav('login')}>Login</span>
              </li>
              <li className="nav-item">
                <span className="nav-link text-white fs-5 fw-medium" style={{ cursor: 'pointer' }} onClick={() => onNav('register')}>Register</span>
              </li>
            </>
          )}
          {user && (
            <>
              <li className="nav-item">
                <span className="nav-link text-white fs-5 fw-medium" style={{ cursor: 'pointer' }} onClick={onProfile}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="profile-icon">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
              </li>
              <li className="nav-item">
                <span className="nav-link text-white fs-5 fw-medium" style={{ cursor: 'pointer' }} onClick={onLogout}>Logout</span>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  </header>
);

export default Header;
