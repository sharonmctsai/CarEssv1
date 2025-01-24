import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Spinner } from 'react-bootstrap';

function Reservation() {
    const [step, setStep] = useState(1); // 步驟控制
    const [formData, setFormData] = useState({
        service_type: '',
        date: '',
        time: '',
    });
    const [availableTimes, setAvailableTimes] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        if (formData.date) {
            fetch(`http://localhost:5002/api/available-times?date=${formData.date}`)
                .then(res => res.json())
                .then(data => setAvailableTimes(data.available_times))
                .catch(err => console.error(err));
        }
    }, [formData.date]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5002/api/reserve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, user_email: 'user@example.com' }),
            });

            if (response.ok) {
                alert('Reservation successful!');
                setFormData({ service_type: '', date: '', time: '' });
                setStep(1);
            } else {
                const error = await response.json();
                alert(error.error);
            }
        } catch (error) {
            console.error("Network error:", error);
            alert('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="my-5">
            <h2 className="text-center">Make a Reservation</h2>
            {step === 1 && (
                <Form>
                    <Form.Group>
                        <Form.Label>Service Type</Form.Label>
                        <Form.Control 
                            as="select" 
                            name="service_type" 
                            value={formData.service_type} 
                            onChange={handleChange} 
                            required>
                            <option value="">Select a service</option>
                            <option value="Pre NCT">Pre NCT</option>
                            <option value="Car Servicing">Car Servicing</option>
                            <option value="Schedule Service">Schedule Service</option>
                        </Form.Control>
                    </Form.Group>
                    <Button 
                        variant="primary" 
                        onClick={() => setStep(2)} 
                        className="mt-3"
                        disabled={!formData.service_type}>
                        Next
                    </Button>
                </Form>
            )}

            {step === 2 && (
                <Form>
                    <Form.Group>
                        <Form.Label>Date</Form.Label>
                        <Form.Control 
                            type="date" 
                            name="date" 
                            value={formData.date} 
                            onChange={handleChange} 
                            required />
                    </Form.Group>
                    <Button 
                        variant="primary" 
                        onClick={() => setStep(3)} 
                        className="mt-3"
                        disabled={!formData.date}>
                        Next
                    </Button>
                </Form>
            )}

            {step === 3 && (
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>Time</Form.Label>
                        {availableTimes.length > 0 ? (
                            <Form.Control 
                                as="select" 
                                name="time" 
                                value={formData.time} 
                                onChange={handleChange} 
                                required>
                                <option value="">Select a time</option>
                                {availableTimes.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </Form.Control>
                        ) : (
                            <Spinner animation="border" />
                        )}
                    </Form.Group>
                    <Button variant="primary" type="submit" className="mt-3" disabled={!formData.time}>
                        {loading ? "Submitting..." : "Submit Reservation"}
                    </Button>
                </Form>
            )}
        </Container>
    );
}

export default Reservation;
