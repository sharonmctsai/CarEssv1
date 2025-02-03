import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Register.css'; // Import custom styles
import { FaUser,FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State for password visibility
    const [isHovered, setIsHovered] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility

    const navigate = useNavigate();

    const validateForm = () => {
        let newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = "Name is required.";
        }
        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format.";
        }
        if (!formData.password) {
            newErrors.password = "Password is required.";
        } else if (formData.password.length < 4) {
            newErrors.password = "Password must be at least 4 characters.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' }); // Clear errors on input change
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const response = await fetch('http://localhost:5002/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success('Registration successful! Please login.', { autoClose: 2000 });
                navigate('/login');
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
        <div className="register-container">
            <form className="register-form" onSubmit={handleSubmit}>
                <h2>Register</h2>

                    {/* Email Field with Icon */}
                    <div className="input-group">
                    <FaUser className="icon" />
                <input
                    type="text"
                    name="name"
                    placeholder="UserName"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control"
                />
                </div>
                {errors.name && <p className="error-text">{errors.name}</p>}

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
                </div>
                {errors.email && <p className="error-text">{errors.email}</p>}

                 {/* Password Field with Eye Toggle */}
                 <div className="input-group">
                    <FaLock className="icon" />
                <div className="form-group position-relative">
                    <input
                        type={isPasswordVisible ? 'text' : 'password'} // Toggle password visibility
                        name="password"
                        placeholder="Enter your Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-control"
                    />
                    </div>
                    <div
                        className="password-icon"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)} // Toggle visibility
                    >
                        {isPasswordVisible ? <FaEye /> : <FaEyeSlash />} {/* Toggle icon */}
                    </div>
                    {errors.password && <div className="error-text">{errors.password}</div>}
                </div>
                {errors.password && <p className="error-text">{errors.password}</p>}

                <button
                    type="submit"
                    className="neon-button"
                    style={{ ...styles.button, backgroundColor: isHovered ? '#00cc70' : '#4cc9f0' }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    Register
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

export default Register;
