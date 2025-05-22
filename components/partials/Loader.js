// components/Loader.js
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Spinner } from 'react-bootstrap';

const Loader = ({ delay = 500, slice }) => {
    
  const loading = useSelector((state) => state[slice]?.loading); // Make it dynamic based on slice
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let timer;

    if (loading) {
      timer = setTimeout(() => {
        setShowLoader(true);
      }, delay);
    } else {
      setShowLoader(false);
    }

    return () => clearTimeout(timer);
  }, [loading, delay]);

  const loaderStyle = {
    position: 'fixed',
    bottom: '60px',
    right: '20px',
    zIndex: 1050,
  };

  const spinnerStyle = {
    width: '2rem',
    height: '2rem',
    borderWidth: '0.2rem',
    color: 'primary',
  };

  return showLoader ? (
    <div style={loaderStyle}>
      <Spinner style={spinnerStyle} animation="border" variant="primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  ) : null;
};

export default Loader;