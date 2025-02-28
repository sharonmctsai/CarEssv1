// EditReservation.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Form, Button, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

function EditReservation() {
    const { user } = useContext(UserContext);
    const { id } = useParams(); // 從路由取得預約 ID
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
    const [serviceItems, setServiceItems] = useState([]); // Store fetched service items

    // 取得舊的預約資料
    useEffect(() => {
        fetch(`http://localhost:5002/api/reservations?email=${user?.email}`)
            .then(res => res.json())
            .then(data => {
                // 在使用者的所有預約中，找到對應 id
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

     // Fetch service items from the backend
     useEffect(() => {
        fetch(`http://localhost:5002/api/service-items`)
            .then(res => res.json())
            .then(data => {
                setServiceItems(data);
            })
            .catch(err => console.error("Error fetching service items:", err));
    }, []);


    // 動態載入可用時段
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

            // Ensure status is set to "pending" after update
    const updatedData = {
        ...formData,
        status: "pending" // Reset status after editing
    };
    console.log("Sending updated data:", updatedData); // Debugging: Check if status is included


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
            <h2 className="text-center mb-4">Edit Reservation</h2>
            <Form onSubmit={handleUpdate}>
                <Form.Group className="mb-3">
                    <Form.Label>Service Type</Form.Label>
                    <Form.Control
                        as="select"
                        name="service_type"
                        value={formData.service_type}
                        onChange={handleChange}
                        required
                        style={{ color: 'black' }}  

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
                    <Form.Label>Car Model</Form.Label>
                    <Form.Control
                        type="text"
                        name="car_model"
                        value={formData.car_model}
                        onChange={handleChange}
                        required
                        style={{ color: 'black' }}  

                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>License Plate</Form.Label>
                    <Form.Control
                        type="text"
                        name="license_plate"
                        value={formData.license_plate}
                        onChange={handleChange}
                        required
                        style={{ color: 'black' }}  

                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        style={{ color: 'black' }}  

                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Time</Form.Label>
                    {availableTimes.length > 0 ? (
                        <Form.Control
                            as="select"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            required
                            style={{ color: 'black' }}  

                        >
                            {/* 若舊的 time 已被佔用，使用者仍可保留該時段；可根據需求決定邏輯 */}
                            <option value={formData.time}>{formData.time}</option>
                            {availableTimes.map(t => (
                                t !== formData.time && <option key={t} value={t}>{t}</option>
                            ))}
                        </Form.Control>
                    ) : (
                        <Spinner animation="border" size="sm" />
                    )}
                </Form.Group>

                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? "Updating..." : " ↻  Update Reservation"}
                </Button>
                <Button variant="secondary" onClick={() => navigate(-1)}>← Back</Button> {/* Navigate to the previous page */}

            </Form>
        </Container>
    );
}

export default EditReservation;
