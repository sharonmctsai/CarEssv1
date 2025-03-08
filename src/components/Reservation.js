// Reservation.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import './Reservation.css'; // Import the updated CSS file for custom styles
import CalendarComponent from '../components/CalendarComponent';
import TimeDropdownComponent from '../components/TimeDropdownComponent';

function Reservation() {
    const { user } = useContext(UserContext);
    const [step, setStep] = useState(1);
    const [serviceItems, setServiceItems] = useState([]);
    const [formData, setFormData] = useState({
        service_type: '',
        date: '',
        time: '',
        car_model: '',
        license_plate: ''
    });
    const [availableTimes, setAvailableTimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // 取得服務項目列表
    useEffect(() => {
        fetch('http://localhost:5002/api/service-items')
            .then(res => res.json())
            .then(data => setServiceItems(data))
            .catch(err => console.error("Error fetching service items:", err));
    }, []);

    // 根據所選日期獲取可用時段
    useEffect(() => {
        if (formData.date) {
            fetch(`http://localhost:5002/api/available-times?date=${formData.date}`)
                .then(res => res.json())
                .then(data => setAvailableTimes(data.available_times))
                .catch(err => console.error(err));
        }
    }, [formData.date]);

    const handleChange = (e) => {
        setFormData(prev => {
            const updatedForm = { ...prev, [e.target.name]: e.target.value };
            console.log("Updated formData:", updatedForm);  // Debugging
            return updatedForm;
        });
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5002/api/reserve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, user_email: user?.email || 'guest@example.com' }),
            });

            if (response.ok) {
                alert('Reservation successful!');
                setFormData({
                    service_type: '',
                    date: '',
                    time: '',
                    car_model: '',
                    license_plate: ''
                });
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

        <Container className="my-5">
            <h2 className="text-center mb-4">Make a Reservation</h2>
            {step === 1 && (
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Service Type</Form.Label>
                        <Form.Control 
                            as="select"
                            name="service_type"
                            value={formData.service_type}
                            onChange={handleChange}
                            required

                        >
                            <option value="">Select a service</option>
                            {serviceItems.length === 0 ? (
                                <option>Loading...</option>
                            ) : (
                                serviceItems.map(item => (
                                    <option key={item.id} value={item.name}>
                                        {item.name}
                                    </option>
                                ))
                            )}
                        </Form.Control>
                    </Form.Group>
                    

                    <Form.Group className="mb-3">
                        <Form.Label>Car Model</Form.Label>
                        <Form.Control
                            type="text"
                            name="car_model"
                            value={formData.car_model}
                            onChange={handleChange}
                            placeholder="e.g. Toyota Corolla"
                            required

                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>License Plate</Form.Label>
                        <Form.Control
                            type="text"
                            name="license_plate"
                            value={formData.license_plate}
                            onChange={handleChange}
                            placeholder="e.g. ABC-123"
                            required
                        />
                    </Form.Group>

                    <Button 
                        variant="primary"
                        onClick={() => setStep(2)}
                        className="neon-button"

                        disabled={
                            !formData.service_type ||
                            !formData.car_model ||
                            !formData.license_plate
                        }
                    >
                        Next
                    </Button>
                    <Button 
                            variant="secondary" 
                            onClick={() => navigate('/dashboard')} 
                            className="mt-3 cancel-button">
                            Cancel
                        </Button>
                </Form>
            )}

            {step === 2 && (
                <Form>
                     <Form.Group>
                        <CalendarComponent selectedDate={formData.date} setSelectedDate={(date) => setFormData({ ...formData, date })} />
                    </Form.Group>
                    <Button
                        variant="primary"
                        onClick={() => setStep(3)}
                        className="neon-button"

                        disabled={!formData.date}
                    >
                        Next
                    </Button>

                    <Button 
                            variant="secondary" 
                            onClick={() => setStep(1)} 
                            className="mt-3 neon-button">
                            Go Back
                        </Button>
                </Form>
            )}

            {step === 3 && (
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Time</Form.Label>
                        {availableTimes.length > 0 ? (
                        <TimeDropdownComponent
                            selectedTime={formData.time}
                            setSelectedTime={(time) => setFormData({ ...formData, time })}
                            availableTimes={availableTimes}
                        />
                    ) : availableTimes.length === 0 && formData.date ? (
                        <p className="text-danger">No available time slots for this date.</p>
                    ) : (
                        <Spinner animation="border" size="sm" />
                    )}

                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={!formData.time} className="w-100">
  {loading ? "Submitting..." : "Submit Reservation"}
</Button>

                    <Button 
                            variant="secondary" 
                            onClick={() => setStep(2)} 
                            className="mt-3 neon-button">
                            Go Back
                        </Button>
                    
                </Form>
            )}
        </Container>
        </div>
    );
}

export default Reservation;
