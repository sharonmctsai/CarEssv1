import React, { useState, useEffect, useContext } from 'react';
import { Container, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import './Reservation.css'; // Import the updated CSS file for custom styles

function Reservation() {
    const { user } = useContext(UserContext);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        service_type: '',
        date: '',
        time: '',
    });
    const [availableTimes, setAvailableTimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
                body: JSON.stringify({ ...formData, user_email: user?.email }),
            });

            if (response.ok) {
                alert('Reservation successful!');
                setFormData({ service_type: '', date: '', time: '' });
                setStep(1);
                navigate('/dashboard');
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
        <div className="reservation-container">
            <Container className="reservation-form">
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
                                required
                                className="form-control"
                            >
                                <option value="">Select a service</option>
                                <option value="Pre NCT">Pre NCT</option>
                                <option value="Car Servicing">Car Servicing</option>
                                <option value="Schedule Service">Schedule Service</option>
                            </Form.Control>
                        </Form.Group>
                        <Button 
                            variant="primary" 
                            onClick={() => setStep(2)} 
                            className="mt-3 neon-button"
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
                                required 
                                className="form-control"
                            />
                        </Form.Group>
                        <Button 
                            variant="primary" 
                            onClick={() => setStep(3)} 
                            className="mt-3 neon-button"
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
                                    required
                                    className="form-control"
                                >
                                    <option value="">Select a time</option>
                                    {availableTimes.map(time => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </Form.Control>
                            ) : (
                                <Spinner animation="border" className="neon-spinner" />
                            )}
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3 neon-button" disabled={!formData.time}>
                            {loading ? "Submitting..." : "Submit Reservation"}
                        </Button>
                    </Form>
                )}
            </Container>
        </div>
    );
}

export default Reservation;
