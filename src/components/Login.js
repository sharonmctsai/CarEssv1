import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext'; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
    const { setUser } = useContext(UserContext); 
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isHovered, setIsHovered] = useState(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();

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
                toast.error(error.error, { autoClose: 3000 }); // Use toast instead of alert
            }
        } catch (error) {
            console.error("Network error:", error);
            toast.error('Network error. Please try again.', { autoClose: 3000 });
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Login</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    style={styles.input}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    style={styles.input}
                />
                <button
                    type="submit"
                    style={{ ...styles.button, backgroundColor: isHovered ? '#0056b3' : '#007BFF' }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    Login
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: '24px',
        marginBottom: '20px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        width: '300px',
    },
    input: {
        marginBottom: '15px',
        padding: '10px',
        fontSize: '16px',
    },
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