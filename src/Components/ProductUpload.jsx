import React, { useState, useEffect } from 'react';
import AddProduct from "./AddProduct";
import { useNavigate } from "react-router-dom";

const ProductUpload = () => {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsAddProductOpen(true); // open automatically when page loads
  }, []);

  const handleClose = () => {
    setIsAddProductOpen(false);
    navigate(-1); // go back to the previous page
  };

  return (
    <div>
      <AddProduct
        isOpen={isAddProductOpen}
        onClose={handleClose}
      />
    </div>
  );
};

export default ProductUpload;
