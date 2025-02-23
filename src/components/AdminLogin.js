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
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card className="login-form" style={{ width: '350px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Admin Access</h2>
          <Form onSubmit={handleAdminLogin}>
            {/* Email Field */}
                <div className="input-group">
                    <FaEnvelope className="icon" />
                    <input
                type="text" 
                placeholder="Admin Email" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
              </div>

              {/* Password Field */}
                <div className="input-group">
                 <FaLock className="icon" />
                 <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            <span className="eye-icon" onClick={togglePasswordVisibility}>
                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                    </div>
             {/* Login Button */}
             <button
                    type="submit"
                    className="neon-button"
                    style={{ backgroundColor: isHovered ? "#00cc70" : "#4cc9f0" }}
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
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AdminLogin;
