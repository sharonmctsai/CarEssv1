// NotificationManagement.js
import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaSyncAlt, FaArrowLeft} from 'react-icons/fa';

function NotificationManagement() {
  const [reminderFrequency, setReminderFrequency] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5002/api/update-notification-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder_frequency: reminderFrequency }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('Network error');
    }
  };

  return (
    <Container className="my-5">
      <h2>Notification Management</h2>
      {message && <Alert variant="info">{message}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Set Reminder Frequency (e.g. daily, weekly)</Form.Label>
          <Form.Control
            type="text"
            value={reminderFrequency}
            onChange={(e) => setReminderFrequency(e.target.value)}
            placeholder="Enter frequency"
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" ><FaSyncAlt className="me-2" />
        Update Time
    </Button>

        <Button variant="secondary" onClick={() => navigate(-1)}> 

        <FaArrowLeft className="me-2" />
        Back
        </Button> {/* Navigate to the previous page */}

      </Form>
    </Container>
  );
}

export default NotificationManagement;
