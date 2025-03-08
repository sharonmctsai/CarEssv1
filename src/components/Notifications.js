import React, { useState, useEffect, useContext } from 'react';
import { Container, ListGroup, Spinner, Alert, Button } from 'react-bootstrap';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft } from 'react-bootstrap-icons'; // Import icons
import './Notifications.css'; // Custom styles

function Notifications() {
  const { user } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  const fetchNotifications = async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch(`http://localhost:5002/api/notifications?email=${user.email}`);
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Refresh every 60 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <Container className="notifications-container">
      {/* Back Button */}
      <Button variant="outline-light" className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Back
      </Button>

      <h2 className="text-center">
        <Bell size={30} className="bell-icon" /> Notifications
      </h2>

      {loading && <Spinner animation="border" className="loading-spinner" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {notifications.length === 0 ? (
        <Alert variant="info" className="text-center">No notifications at the moment.</Alert>
      ) : (
        <ListGroup className="notification-list">
          {notifications.map(n => (
            <ListGroup.Item key={n.id} className="notification-item">
              <span className="notification-date">{new Date(n.date).toLocaleString()}</span>
              <p className="notification-message">{n.message}</p>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
}

export default Notifications;
