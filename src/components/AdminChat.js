import React, { useState, useEffect, useContext } from 'react';
import { Container, ListGroup, Spinner, Alert, Form, Button } from 'react-bootstrap';
import { FaPaperPlane, FaUser, FaUserShield } from 'react-icons/fa';
import './AdminChat.css'; // New CSS file for chat styling
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import {  FaArrowLeft} from 'react-icons/fa';

function AdminChat() {
    const { user } = useContext(UserContext);
    const userId = user?.id || JSON.parse(localStorage.getItem('user'))?.id;

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:5002/api/admin/chat')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load messages');
                return res.json();
            })
            .then(data => {
                setMessages(data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching messages:', err);
                setError(err.message);
                setMessages([]);
                setLoading(false);
            });
    }, []);

    const handleAdminReply = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const adminMessage = {
            user_id: userId,
            message: newMessage,
            timestamp: new Date().toLocaleString(),
            is_admin: true,
        };

        fetch('http://localhost:5002/api/admin/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminMessage),
        })
            .then((res) => res.json())
            .then((data) => {
                setMessages((prevMessages) => [...prevMessages, data]);
                setNewMessage('');
            })
            .catch((err) => {
                console.error('Error sending message:', err);
                setError('Failed to send reply. Please try again.');
            });
    };

    return (
        <Container className="chat-container">
         
         <Button variant="secondary" onClick={() => navigate(-1)}> 

<FaArrowLeft className="me-2" />
Back
</Button> {/* Navigate to the previous page */}

            <h2 className="chat-title">Admin Support Chat</h2>
            {loading ? (
                <Spinner animation="border" className="chat-spinner" />
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <div className="chat-box">
                    <ListGroup>
                        {messages.length > 0 ? (
                            messages.map((msg, index) => (
                                <ListGroup.Item 
                                    key={index} 
                                    className={`chat-message ${msg.is_admin ? 'admin-message' : 'user-message'}`}
                                >
                                    <div className="message-content">
                                        {msg.is_admin ? <FaUserShield className="icon" /> : <FaUser className="icon" />}
                                        <div className="message-text">
                                            <small className="message-time">{msg.timestamp}</small>
                                            <p>{msg.message}</p>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            ))
                        ) : (
                            <p className="no-messages">No messages yet</p>
                        )}
                    </ListGroup>
                </div>
            )}

            <Form onSubmit={handleAdminReply} className="chat-input">
                <Form.Control
                    type="text"
                    placeholder="Admin typing response..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)} className="chat-input"
                />
                <Button type="submit" className="send-button">
                    <FaPaperPlane />
                </Button>
            </Form>
        </Container>
    );
}

export default AdminChat;
