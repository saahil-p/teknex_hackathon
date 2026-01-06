import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import ServiceCentres from "./pages/ServiceCentres";
import OrderDetails from "./pages/OrderDetails";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Welcome from "./pages/Welcome";

import ProtectedRoute from "./ProtectedRoute";

import "./App.css";

function App() {

  return (
    <Router>
      <div className="app">

        {/* ❌ REMOVED OLD SIDEBAR — NO DUPLICATE SIDEBAR ANYMORE */}

        <main className="main">
          <Routes>

            {/* Welcome Page */}
            <Route path="/" element={<Welcome />} />

            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />

            <Route
              path="/centres"
              element={
                <ProtectedRoute>
                  <ServiceCentres />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              }
            />

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
