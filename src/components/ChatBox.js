import React, { useState, useEffect, useContext } from 'react';
import { Container, ListGroup, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaPaperPlane, FaUser, FaUserShield } from 'react-icons/fa';
import './ChatBox.css';
import { UserContext } from '../context/UserContext'; //  using a context to get the user
import { db } from '../firebase'; // Firebase configuration
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

function ChatBox() {
    const { user } = useContext(UserContext);  // using a context to get the logged-in user
    const userId = user?.id || JSON.parse(localStorage.getItem('user'))?.id;

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Firestore query to listen for changes to the messages collection
        const messagesRef = collection(db, 'chats');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setMessages(messagesData);
            setLoading(false);
        }, (err) => {
            console.error('Error fetching messages:', err);
            setError('Failed to load messages.');
            setLoading(false);
        });

        // Cleanup the listener when the component is unmounted
        return () => unsubscribe();
    }, []);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim()) return;

        const messageData = {
            user_id: userId,
            message: newMessage,
            is_admin: false,  // Set to false as this is a user message
            timestamp: new Date(),
        };

        try {
            // Add the message to Firestore
            await addDoc(collection(db, 'chats'), messageData);
            setNewMessage('');
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Failed to send message. Please try again.');
        }
    };

    return (
        <Container className="chat-container">
            <h2 className="chat-title">User Support Chat</h2>

            {loading ? (
                <Spinner animation="border" className="chat-spinner" />
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <div className="chat-box">
                    <ListGroup>
                        {messages.length > 0 ? (
                            messages.map((msg) => (
                                <ListGroup.Item
                                    key={msg.id}
                                    className={`chat-message ${msg.is_admin ? 'admin-message' : 'user-message'}`}
                                >
                                    <div className="message-content">
                                        {msg.is_admin ? <FaUserShield className="icon" /> : <FaUser className="icon" />}
                                        <div className="message-text">
                                            <small className="message-time">{new Date(msg.timestamp?.seconds * 1000).toLocaleString()}</small>
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

            <Form onSubmit={handleSendMessage} className="chat-input">
                <Form.Control
                    type="text"
                    placeholder="Type your query..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="chat-input-field"
                    
                    
                />
                <Button type="submit" className="send-button">
                    <FaPaperPlane />
                </Button>
            </Form>
        </Container>
    );
}

export default ChatBox;
