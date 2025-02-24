import React from 'react';
import { Navbar, Nav, Container } from "react-bootstrap";

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from './context/UserContext'; 
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import UserProfile from "./components/UserProfile"; 
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import Reservation from './components/Reservation';
import About from "./components/About";
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for toast notifications

function App() {
    return (
      <UserProvider>
          <Navbar />

          <Router>
              <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/about" element={<About />} />

                      <Route path="/dashboard" element={<UserDashboard />} />
                      <Route path="/profile" element={<UserProfile />} /> 

                      <Route path="/admin-dashboard" element={<AdminDashboard />} />
                      <Route path="/admin-login" element={<AdminLogin />} />
                      <Route path="/reservation" element={<Reservation />} />
              </Routes>
              {/* Add ToastContainer here to render toast notifications */}
              <ToastContainer
                  position="top-right"
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
              />
          </Router>
      </UserProvider>
    );
}

export default App;
