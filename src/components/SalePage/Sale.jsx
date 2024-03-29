// Sale.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ReactStars from "react-rating-stars-component";
import CommentModal from "./CommentModal"; // Import CommentModal component

const Sale = ({ username }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [currentCategory, setCurrentCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false); // State for showing the comment modal
  const [commentProduct, setCommentProduct] = useState(null); // State for storing the product to comment on

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/GreenMarket/show_products.php"
        );
        console.log(response.data);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products
    .filter(
      (product) =>
        currentCategory === "all" || product.Category === currentCategory
    )
    .filter((product) =>
      product.ProductName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setSelectedQuantity(1);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleQuantityChange = (change) => {
    setSelectedQuantity((prevQuantity) => {
      const newQuantity = prevQuantity + change;
      return Math.min(Math.max(newQuantity, 1), selectedProduct.Quantity);
    });
  };

  const handleAddToCart = async () => {
    if (username) {
      if (!selectedProduct || selectedQuantity <= 0) {
        toast.error("Please select a product and specify a valid quantity.");
        return;
      }

      // Assuming username is the memberID
      const productID = parseInt(selectedProduct.ProductID, 10);
      const quantity = parseInt(selectedQuantity, 10);

      if (quantity > selectedProduct.Quantity) {
        toast.error(
          "The selected quantity is greater than the available quantity."
        );
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:8080/GreenMarket/insert_cart.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              productID: productID,
              quantity: quantity,
              Email: username, // Include the memberID in the request
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          toast.success(
            `Added ${selectedProduct.ProductName} (${quantity})  to the cart`
          );
          setSelectedProduct(null);
          if (quantity === selectedProduct.Quantity) {
            // If the selected quantity is equal to the available quantity, close the modal
            handleCloseModal();
          }
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to add items to the cart");
        }
      } catch (error) {
        console.error("Error adding items to the cart:", error);
        toast.error("Failed to add items to the cart");
      }
    } else {
      toast.error("Please Login!!");
      navigate("/login");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.ProductName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to handle clicking on "Add&View Comment"
  const handleComment = (product) => {
    setCommentProduct(product); // Set the product to comment on
    refreshProductData();
    setShowCommentModal(true); // Show the comment modal
  };

  const refreshProductData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/GreenMarket/show_products.php"
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Product List</h1>

      {/* เพิ่มกล่องค้นหา */}
      <div className="mb-4 flex items-center">
        <input
          type="text"
          placeholder="Search by Product Name"
          className="p-2 border rounded mr-2"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded focus:outline-none focus:shadow-outline"
          onClick={() => setCurrentCategory("all")}
        >
          All
        </button>
      </div>

      {/* เพิ่มปุ่มสวิตช์สำหรับผักและผลไม้ */}
      <div className="mb-4">
        <button
          className={`mr-2 px-4 py-2 border rounded focus:outline-none focus:shadow-outline ${
            currentCategory === "Vegetable"
              ? "bg-green-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setCurrentCategory("Vegetable")}
        >
          Vegetables
        </button>
        <button
          className={`px-4 py-2 border rounded focus:outline-none focus:shadow-outline ${
            currentCategory === "Fruit"
              ? "bg-green-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setCurrentCategory("Fruit")}
        >
          Fruits
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {filteredProducts.length === 0 ? ( // ตรวจสอบว่าไม่พบสินค้าที่ตรงกับคำค้นหา
          <div className="bg-gradient-to-r from-pink-400 to-purple-500 p-8 rounded-lg shadow-lg text-white">
            <p className="text-center text-3xl font-bold mb-4">
              No products found.
            </p>
            <p className="text-center text-lg">
              Sorry, we couldn't find any products matching your search.
            </p>
          </div>
        ) : (
          // ถ้าพบสินค้าที่ตรงกับคำค้นหา
          currentProducts.map((product) => (
            <div
              key={product.ProductID}
              className="bg-white overflow-hidden shadow-lg rounded-lg mb-4 transition-transform transform hover:scale-105 hover:shadow-xl cursor-pointer"
              onClick={() => handleProductClick(product)}
            >
              <img
                src={product.ImageURL}
                alt={product.ProductName}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">
                  {product.ProductName}
                </h2>
                <p className="text-gray-700 mb-2">
                  Price: {product.Price}฿/1Kg.
                </p>
                <p className="text-gray-700">Type: {product.Category}</p>
                <ReactStars
                  count={5}
                  value={product.score} // กำหนดค่า score ของสินค้าที่มีอยู่ (อาจเป็นค่าที่ได้จากฐานข้อมูลหรือตัวแปรอื่นๆ)
                  size={24}
                  activeColor="#ffd700"
                  edit={false} // กำหนดให้ไม่สามารถแก้ไข score ได้
                />
              </div>
            </div>
          ))
        )}
      </div>

      {filteredProducts.length > 0 && (
        <div className="flex justify-center mt-8 mb-5">
          {Array.from(
            { length: Math.ceil(filteredProducts.length / productsPerPage) },
            (_, i) => (
              <button
                key={i + 1}
                className={`mx-2 px-4 py-2 border rounded focus:outline-none focus:shadow-outline ${
                  currentPage === i + 1
                    ? `bg-gradient-to-r from-blue-500 to-green-500 text-white`
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => paginate(i + 1)}
              >
                {i + 1}
              </button>
            )
          )}
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 max-w-md w-full rounded-lg overflow-y-auto">
            <div className="flex justify-end">
              <button
                className="text-gray-500 hover:text-gray-700 text-3xl"
                onClick={handleCloseModal}
              >
                &#215;
              </button>
            </div>
            <h2 className="text-2xl font-bold mb-4">
              {selectedProduct.ProductName}
            </h2>
            <img
              src={selectedProduct.ImageURL}
              alt={selectedProduct.ProductName}
              className="w-full h-40 object-cover mb-4"
            />
            <ReactStars
              count={5}
              value={parseInt(selectedProduct.score)}
              size={24}
              activeColor="#ffd700"
              edit={false}
            />
            <p className="text-gray-700 mb-2">
              price: {selectedProduct.Price}฿/1Kg.
            </p>
            <p className="text-gray-700 mb-2">
              type: {selectedProduct.Category}
            </p>
            <p className="text-gray-700 mb-2">
              detail: {selectedProduct.AdditionalInfo}
            </p>
            <p className="text-gray-700 mb-2">
              remaining: {selectedProduct.Quantity}
            </p>

            <div className="flex items-center mb-4">
              <button
                className="px-3 py-1 border rounded-l focus:outline-none"
                onClick={() => handleQuantityChange(-1)}
              >
                -
              </button>
              <div className="px-3 py-1 border-t border-b">
                {selectedQuantity}
              </div>
              <button
                className="px-3 py-1 border rounded-r focus:outline-none"
                onClick={() => handleQuantityChange(1)}
              >
                +
              </button>
            </div>

            <button
              className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 focus:outline-none focus:shadow-outline"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
            <button
              className="ml-5 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 focus:outline-none focus:shadow-outline"
              onClick={() =>
                handleComment(selectedProduct, selectedProduct.comment)
              } // ส่ง selectedProduct.comment มาผ่าน prop
            >
              Add&View Comment
            </button>
          </div>
        </div>
      )}
      {showCommentModal && commentProduct && (
        <CommentModal
          product={commentProduct}
          closeModal={() => setShowCommentModal(false)} // Function to close the modal
          username={username} // Pass the username prop to CommentModal
        />
      )}
    </div>
  );
};

export default Sale;
