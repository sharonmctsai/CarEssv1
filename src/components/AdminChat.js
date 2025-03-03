import React, { useState, useEffect, useContext } from 'react';
import { Container, ListGroup, Spinner, Alert, Form, Button } from 'react-bootstrap';
import './Home.css';
import { UserContext } from '../context/UserContext'; // Import UserContext

function AdminChat() {
    const { user } = useContext(UserContext); // Access the logged-in user from context
    const userId = user?.id || JSON.parse(localStorage.getItem('user'))?.id; // Fallback to localStorage if context is not available

    const [messages, setMessages] = useState([]); 
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5002/api/admin/chat')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load messages');
                return res.json();
            })
            .then(data => {
                setMessages(data || []);  // Ensure data is an array
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching messages:', err);
                setError(err.message);
                setMessages([]); // Prevent undefined issues
                setLoading(false);
            });
    }, []);

    const handleAdminReply = (e) => {
        e.preventDefault();

        if (!newMessage.trim()) return; // Don't send empty messages

        const adminMessage = {
            user_id: userId,  // Store the userId to track who the admin is replying to
            message: newMessage,
            timestamp: new Date().toLocaleString(),
            is_admin: true,  // Indicate this is an admin's reply
        };
    console.log('Sending admin message:', adminMessage);  // Add this log

        // Send the reply to the server (or add to the local state temporarily)
        fetch('http://localhost:5002/api/admin/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminMessage),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log('Backend response:', data);  // Log the response from the backend

                setMessages((prevMessages) => [...prevMessages, data]); // Add the new message to the state
                setNewMessage(''); // Clear the input field
            })
            .catch((err) => {
                console.error('Error sending message:', err);
                setError('Failed to send reply. Please try again.');
            });
    };

    return (
        <Container className="my-4">
            <h2>Admin Support Chat</h2>
            {loading ? (
                <Spinner animation="border" />
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <ListGroup>
                    {messages && messages.length > 0 ? (
                        messages.map((msg, index) => (
                            <ListGroup.Item 
                                key={index} 
                                className={msg.is_admin ? 'admin-message' : 'user-message'}>
                                <small>{msg.timestamp}:</small> {msg.is_admin ? "Admin: " : "User: "} {msg.message}

                            </ListGroup.Item>
                        ))
                    ) : (
                        <p>No messages yet</p>
                    )}
                </ListGroup>
            )}
            <Form onSubmit={handleAdminReply} className="mt-3">
                <Form.Control
                    type="text"
                    placeholder="Type your response..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" className="mt-2">Send</Button>
            </Form>
        </Container>
    );
}

export default AdminChat;
