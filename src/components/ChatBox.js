import React, { useState, useEffect, useContext } from 'react';
import { Container, Form, Button, ListGroup, Spinner, Alert } from 'react-bootstrap';
import './ChatBox.css';
import { UserContext } from '../context/UserContext'; // Import UserContext
import { useNavigate } from 'react-router-dom';
import {  FaArrowLeft} from 'react-icons/fa';

function ChatBox({ userId: propUserId }) {

    // Use context if propUserId is not provided
    const { user } = useContext(UserContext); 
    const userId = propUserId || user?.id || JSON.parse(localStorage.getItem('user'))?.id;
    const navigate = useNavigate();

    console.log('User ID:', userId); // Debugging

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch messages for the logged-in user
    useEffect(() => {
        if (!userId) {
            setError('User ID is missing. Please log in.'); // Handle missing userId
            setLoading(false);
            return;
        }

        const fetchMessages = async () => {
            try {
                const response = await fetch(`http://localhost:5002/api/chat/${userId}`);
                if (!response.ok) throw new Error('Failed to load messages');
                const data = await response.json();
                console.log('Fetched messages:', data); // Debugging
                setMessages(data); // Update state with fetched messages
            } catch (err) {
                console.error('Error fetching messages:', err); // Debugging
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [userId]); // Re-fetch when userId changes

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        if (!userId) {
            setError('User ID is missing. Please log in.'); // Handle missing userId
            return;
        }

        try {
            const payload = { user_id: userId, message: newMessage };
            console.log('Sending payload:', payload); // Debugging

            const response = await fetch('http://localhost:5002/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            console.log('Response status:', response.status); // Debugging
            const responseBody = await response.json();
            console.log('Response body:', responseBody); // Debugging

            if (response.ok) {
                setMessages((prevMessages) => [...prevMessages, responseBody]);
                setNewMessage('');
            } else {
                throw new Error(responseBody.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setError('Failed to send message. Please try again.');
        }
    };

    return (
        <Container className="chat-container">
                <Button variant="secondary" onClick={() => navigate(-1)}> 

<FaArrowLeft className="me-2" />
Back
</Button> {/* Navigate to the previous page */}

            <h2 className="chat-title">Chat with Support</h2>

            {loading ? (
                <Spinner animation="border" variant="light" />
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <ListGroup className="chat-messages">
                    {messages.map((msg) => (
                        <ListGroup.Item
                            key={msg.id}
                            className={msg.is_admin ? "admin-message" : "user-message"}
                        >
                            <small>{new Date(msg.timestamp).toLocaleString()}</small>  
                            <p>{msg.message}</p>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}

            <Form onSubmit={handleSendMessage} className="message-form">
                <Form.Control
                    type="text"
                    placeholder="User typing message..."
                    className="message-input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" className="send-button">Send</Button>
            </Form>
        </Container>
    );
}

export default ChatBox;
