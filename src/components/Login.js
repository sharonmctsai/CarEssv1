import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext'; // 引入全局上下文
import styled from 'styled-components';

// Styled components
const StyledButton = styled.button`
    padding: 10px;
    font-size: 16px;
    background-color: #007BFF;
    color: #fff;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #0056b3;
    }
`;

const StyledInput = styled.input`
    margin-bottom: 15px;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
`;

const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    width: 300px;
`;

const StyledContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f9f9f9;
`;

const StyledTitle = styled.h2`
    font-size: 24px;
    margin-bottom: 20px;
`;

function Login() {
    const { setUser } = useContext(UserContext); // 獲取上下文的 setUser 方法
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState(''); // Add error state

    const navigate = useNavigate();

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
                // 保存用戶信息到全局狀態
                // Save user details to localStorage
            localStorage.setItem('user', JSON.stringify({ name: result.name, email: formData.email }));
                // Update the context state

                setUser({ name: result.name, email: formData.email });
                console.log('API Response:', result); // Debugging: Log the API response
                console.log('User set:', { name: result.name, email: result.email }); // Debugging

                alert('Login successful');
                // 跳轉到主頁
                navigate('/dashboard', { state: { user: result.name } });

            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Login failed. Please try again.');

            }
        } catch (error) {
            console.error("Network error:", error);
            alert('Network error. Please try again.');
        }
    };
    

    return (
        <StyledContainer>
            <StyledTitle>Login</StyledTitle>
            <StyledForm onSubmit={handleSubmit}>
                <StyledInput
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                />
                <StyledInput
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                />
                <StyledButton type="submit">Login</StyledButton>
            </StyledForm>
        </StyledContainer>
    );
}


export default Login;
