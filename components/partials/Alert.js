import React, { useState, useEffect } from "react";
import { Alert } from "react-bootstrap";
import PropTypes from "prop-types";

const Alerts = ({ variant, message, autoClose = 3000 }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, autoClose);

    return () => clearTimeout(timer);
  }, [autoClose]);

  if (!show) return null;

  return (
    <Alert variant={variant} onClose={() => setShow(false)} dismissible>
      {message}
    </Alert>
  );
};

Alerts.propTypes = {
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "success",
    "danger",
    "warning",
    "info",
    "light",
    "dark",
    "outline-primary",
    "outline-secondary",
    "outline-success",
    "outline-danger",
    "outline-warning",
    "outline-info",
    "outline-light",
    "outline-dark"
  ]).isRequired,
  message: PropTypes.string.isRequired,
  autoClose: PropTypes.number
};

export default Alerts;