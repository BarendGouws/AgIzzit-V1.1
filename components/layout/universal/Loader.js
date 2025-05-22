import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loader = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Full viewport height
        width: '100%', // Full width
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Optional background overlay
      }}
    >
      <Spinner
        animation="border"
        role="status"
        style={{ width: '4rem', height: '4rem' }} // Larger size
        variant="primary" // Primary color
      >
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

export default Loader;
