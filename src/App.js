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
import EditReservation from './components/EditReservation';
import About from "./components/About";
import AvailableTimesManagement from './components/AvailableTimesManagement';
import DataManagement from './components/DataManagement';
import Notifications from './components/Notifications';

import NotificationManagement from './components/NotificationManagement';import { ToastContainer } from 'react-toastify'; // Import ToastContainer
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
                      <Route path="/edit-reservation/:id" element={<EditReservation />} />

                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/admin/notification-management" element={<NotificationManagement />} />

                      <Route path="/admin/available-times" element={<AvailableTimesManagement />} />
                      <Route path="/admin/data-management" element={<DataManagement />} />
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
