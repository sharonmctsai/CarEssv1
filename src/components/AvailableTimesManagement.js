// AvailableTimesManagement.js
import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaSyncAlt, FaArrowLeft} from 'react-icons/fa';

function AvailableTimesManagement() {
  const [times, setTimes] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    // example "08:00,09:00,10:00"
    const timesArray = times.split(',').map(t => t.trim());
    try {
      const response = await fetch('http://localhost:5002/api/update-available-times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available_times: timesArray }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Network error");
    }
  };

  return (
    <Container className="my-5">
      <h2>Manage Available Times</h2>
      {message && <Alert variant="info">{message}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Available Times (comma separated, e.g. "09:00,10:00,11:00")</Form.Label>
          <Form.Control
            type="text"
            value={times}
            onChange={(e) => setTimes(e.target.value)}
            placeholder="Enter available times"
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

export default AvailableTimesManagement;
