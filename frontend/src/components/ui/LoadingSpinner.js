import React from 'react';

const LoadingSpinner = ({ show }) => (
  show ? (
    <div className="loading-spinner" role="status" aria-label="Loading"></div>
  ) : null
);

export default LoadingSpinner;
