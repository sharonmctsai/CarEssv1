import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext'; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons

function Login() {
    const { setUser } = useContext(UserContext); 
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isHovered, setIsHovered] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility

    const navigate = useNavigate();
    const location = useLocation(); // Get location state

    useEffect(() => {
        // Show toast if user is redirected from a protected route
        if (location.state?.from) {
            toast.warn('Please log in to continue.', { autoClose: 3000 });
        }
    }, [location]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is not valid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return; // Do not submit if there are validation errors
        }

        try {
            const response = await fetch('http://localhost:5002/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const result = await response.json();
              
                // Save user details to localStorage
                localStorage.setItem('user', JSON.stringify({ name: result.name, email: formData.email }));
                setUser({ name: result.name, email: formData.email });

                toast.success('Login successful!', { autoClose: 2000 });

                // Navigate to user dashboard
                navigate('/dashboard', { state: { user: result.name } });
            } else {
                const error = await response.json();
                toast.error(error.error, { autoClose: 3000 });
            }
        } catch (error) {
            console.error("Network error:", error);
            toast.error('Network error. Please try again.', { autoClose: 3000 });
        }
    };

        // Cancel button handler (navigates to home page)
        const handleCancel = () => {
            navigate('/');
        };
    

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2 className="form-title">Login</h2>
                {/* Email Field with Icon */}
                <div className="input-group">
                    <FaEnvelope className="icon" />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-control"
                    />
                    {errors.email && <div className="error-text">{errors.email}</div>}
                </div>
                {/* Password Field with Eye Toggle */}
                <div className="input-group">
                    <FaLock className="icon" />
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-control"
                    />
                    <span className="eye-icon" onClick={togglePasswordVisibility}>
                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                </div>
                <button
                    type="submit"
                    className="neon-button"
                    style={{ ...styles.button, backgroundColor: isHovered ? '#00cc70' : '#4cc9f0' }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    Login
                </button>

                <button
                    type="button"
                    className="cancel-button"
                    onClick={handleCancel}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

const styles = {
    button: {
        padding: '10px',
        fontSize: '16px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease-in-out',
    },
};

export default Login;
