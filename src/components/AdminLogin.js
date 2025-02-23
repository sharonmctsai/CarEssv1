import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button } from 'react-bootstrap';
import './Admin.css';  // Import the CSS file here
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [isHovered, setIsHovered] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/api/login', {
        email: username,
        password,
      });
      console.log('Response:', response); // Inspect the full response
  
      if (response && response.data) {
        if (response.data.is_admin) {
          alert(response.data.message);
          navigate('/admin-dashboard');
        } else {
          alert('You are not an Admin');
        }
      } else {
        alert('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error); // Inspect the error
      if (error.response && error.response.data) {
        alert(error.response.data.message);
      } else {
        alert('An error occurred. Please try again.');
      }
    }
  };
  
  
  const handleCancel = () => {
    setUsername('');
    setPassword('');
    navigate('/');  // Navigate to the home page 
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
};

  return (
    <div className="admin-container">
    <div className="admin-card">
      <h2>Admin Login</h2>
      <form onSubmit={handleAdminLogin} className="admin-form">
        <div className="form-group">
        <div className="input-container">
        <FaEnvelope className="icon" />
          <input 
           type="email"
           name="email"
           placeholder="Email"
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            className="input-field"

            required 
          />
        </div>
        </div>
        <div className="form-group">
        <div className="input-container">
        <FaLock className="icon" />
          <input 
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="input-field"
            required 
          />
            <span className="eye-icon" onClick={togglePasswordVisibility}>
             {showPassword ? <FaEye /> : <FaEyeSlash />}
         </span>
        </div>
        </div>
             {/* Login Button */}
             <button
                    type="submit"
                    className="admin-neon-button"
                    style={{ backgroundColor: isHovered ? "#00cc70" : "#ff7f50" }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    Login
                </button>

            <Button 
              variant="danger" 
              type="button" 
              className="cancel-button" 
              onClick={handleCancel}  // Trigger cancel action
            >
              Cancel
            </Button>
          </form>
   </div>
   </div>
  );
}

export default AdminLogin;
