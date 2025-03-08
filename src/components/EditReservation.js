import React, { useState, useEffect, useContext } from 'react';
import { Container, Form, Button, Spinner, Card } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { FaSyncAlt, FaArrowLeft } from 'react-icons/fa';
import "./EditReservation.css"; // Add a CSS file for styling

function EditReservation() {
    const { user } = useContext(UserContext);
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        service_type: '',
        date: '',
        time: '',
        car_model: '',
        license_plate: ''
    });
    const [availableTimes, setAvailableTimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [serviceItems, setServiceItems] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:5002/api/reservations?email=${user?.email}`)
            .then(res => res.json())
            .then(data => {
                const target = data.find(r => r.id === parseInt(id));
                if (target) {
                    setFormData({
                        service_type: target.service_type,
                        date: target.date,
                        time: target.time,
                        car_model: target.car_model || '',
                        license_plate: target.license_plate || ''
                    });
                }
            })
            .catch(err => console.error(err));
    }, [id, user?.email]);

    useEffect(() => {
        fetch(`http://localhost:5002/api/service-items`)
            .then(res => res.json())
            .then(data => {
                setServiceItems(data);
            })
            .catch(err => console.error("Error fetching service items:", err));
    }, []);

    useEffect(() => {
        if (formData.date) {
            fetch(`http://localhost:5002/api/available-times?date=${formData.date}`)
                .then(res => res.json())
                .then(data => setAvailableTimes(data.available_times))
                .catch(err => console.error(err));
        }
    }, [formData.date]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const updatedData = {
            ...formData,
            status: "pending"
        };

        try {
            const response = await fetch(`http://localhost:5002/api/update-reservation/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
            if (response.ok) {
                alert('Reservation updated successfully!');
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
        <Container className="my-5">
            <Card className="p-4 shadow-lg">
            <Form onSubmit={handleUpdate} className="edit-reservation-form">
    <Form.Group className="mb-3">
        <Form.Label className="service-type">Service Type</Form.Label>
        <Form.Control
            as="select"
            name="service_type"
            value={formData.service_type}
            onChange={handleChange}
            required
            className="custom-input"
        >
            <option value="">Select a service</option>
            {serviceItems.length === 0 ? (
                <option>Loading...</option>
            ) : (
                serviceItems.map((item) => (
                    <option key={item.id} value={item.name}>
                        {item.name}
                    </option>
                ))
            )}
        </Form.Control>
    </Form.Group>

    <Form.Group className="mb-3">
        <Form.Label className="car-model">Car Model</Form.Label>
        <Form.Control
            type="text"
            name="car_model"
            value={formData.car_model}
            onChange={handleChange}
            required
            className="custom-input"
        />
    </Form.Group>

    <Form.Group className="mb-3">
        <Form.Label className="license-plate">License Plate</Form.Label>
        <Form.Control
            type="text"
            name="license_plate"
            value={formData.license_plate}
            onChange={handleChange}
            required
            className="custom-input"
        />
    </Form.Group>

    <Form.Group className="mb-3">
        <Form.Label className="date">Date</Form.Label>
        <Form.Control
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="custom-input"
        />
    </Form.Group>

    <Form.Group className="mb-3">
        <Form.Label className="time">Time</Form.Label>
        {availableTimes.length > 0 ? (
            <Form.Control
                as="select"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="custom-input"
            >
                <option value={formData.time}>{formData.time}</option>
                {availableTimes.map(t => (
                    t !== formData.time && <option key={t} value={t}>{t}</option>
                ))}
            </Form.Control>
        ) : (
            <Spinner animation="border" size="sm" />
        )}
    </Form.Group>

    <Button variant="primary" type="submit" disabled={loading} className="custom-btn">
        {loading ? <FaSyncAlt className="spinner-icon" /> : <FaSyncAlt className="me-2" />}
        {loading ? "Updating..." : "Update Reservation"}
    </Button>

    <Button variant="secondary" onClick={() => navigate(-1)} className="custom-back-btn">
        <FaArrowLeft className="me-2" />
        Back
    </Button>
</Form>

            </Card>
        </Container>
    );
}

export default EditReservation;
