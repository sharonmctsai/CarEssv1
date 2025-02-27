// Notifications.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, ListGroup, Spinner, Alert,Button } from 'react-bootstrap';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

function Notifications() {
  const { user } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    if (user?.email) {
      fetch(`http://localhost:5002/api/notifications?email=${user.email}`)
        .then(res => {
          if (!res.ok) {
            throw new Error("Failed to fetch notifications");
          }
          return res.json();
        })
        .then(data => {
          setNotifications(data);
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to load notifications');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="my-5">
            <Button variant="secondary" onClick={() => navigate(-1)}>← Back</Button> {/* Back Button */}

      <h2>Notifications</h2>
      
      {notifications.length === 0 ? (
        <Alert variant="info">No notifications at the moment.</Alert>
      ) : (
        <ListGroup>
          {notifications.map(n => (
            <ListGroup.Item key={n.id}>
              <strong>{n.date}</strong>: {n.message}
            </ListGroup.Item>
            
          ))}
        </ListGroup>
      )}
    </Container>
  );
}

export default Notifications;
