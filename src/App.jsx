import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Footer from "./components/Footer";
import Nav from "./components/Navbar";
import Login from "./components/Login/Login";
import Sale from "./components/SalePage/Sale";
import Register from "./components/Login/Register"; // Import the Register component
import Cart from "./components/Cart/Cart";
import Order from "./components/Order/order";
import Location from "./components/Location/location";
import OderHistory from "./components/Order/orderHistory";

import AdminCenter from "./components/Admin/adminCenter";
import ProductList from "./components/Admin/components/ProductList";
import OrderList from "./components/Admin/components/OrderList";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (user) => {
    try {
      // Your login logic here

      // Assuming successful login, set the user
      setUsername(user);
      setLoggedIn(true);

      navigate("/sale");
    } catch (error) {
      console.error("Error during login:", error);
      // setLoginError("Login failed. Please check your credentials.");
    }
  };

  const handleLogout = () => {
    // Add logic for handling logout, e.g., clearing the user session
    setLoggedIn(false);
    setUsername("");

    // Redirect to the login page after logout
  };

  return (
    <BrowserRouter>
      <ToastContainer />
      <Nav loggedIn={loggedIn} username={username} onLogout={handleLogout} />

      <Routes>
        {/* Use a route for the login page */}
        <Route
          path="/login"
          element={
            loggedIn ? (
              <Navigate to="/sale" />
            ) : (
              <Login
                onLogin={(email, username) => handleLogin(email, username)}
                loginError={loginError}
              />
            )
          }
        ></Route>
        {/* Use a route for the dashboard with a guard for authentication */}
        <Route
          path="/sale"
          element={
            loggedIn ? <Sale username={username} /> : <Navigate to="/login" />
          }
        ></Route>

        {/* Add other routes as needed */}
        <Route path="/" element={<Sale />} />
        <Route path="/register" element={<Register />} />

        <Route path="/cart" element={<Cart username={username} />} />
        <Route path="/order" element={<Order username={username} />} />
        <Route path="/location" element={<Location key={location.key} />} />
        <Route
          path="/order-history"
          element={<OderHistory username={username} />}
        />

        <Route path="/adminC" element={<AdminCenter username={username} />} />

        <Route path="/products" element={<ProductList username={username} />} />
        <Route path="/orderList" element={<OrderList username={username} />} />

        {/* <Route path="/loginP" element={<Login />} /> */}
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
