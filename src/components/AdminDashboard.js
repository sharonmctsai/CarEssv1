import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Spinner, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import "./AdminDB.css"; 

function AdminDashboard() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); 

    // 取得所有預約資料
    useEffect(() => {
        fetch('http://localhost:5002/api/all-reservations')
            .then(res => res.json())
            .then(data => {
                // Ensure data is an array before setting state
                setReservations(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to load reservations');
                setLoading(false);
            });
    }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const response = await fetch('http://localhost:5002/api/update-reservation-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });
            if (response.ok) {
                alert(`Reservation #${id} updated to ${newStatus}`);
                // Frontend update of the table
                setReservations(prev => prev.map(r => (
                    r.id === id ? { ...r, status: newStatus } : r
                )));
            } else {
                const error = await response.json();
                alert(error.error);
            }
        } catch (error) {
            alert('Network error. Please try again.');
        }
    };

        return (
        <Container className="my-5">
            <h2 className="text-center mb-4 text-primary">Admin Dashboard</h2>

            <Row className="mb-4 justify-content-center">
                <Col>
                    <Button as={Link} to="/admin/notification-management" variant="outline-primary" className="me-3 custom-nav-btn">
                        Notification Management
                    </Button>
                    <Button as={Link} to="/admin/available-times" variant="outline-primary" className="me-3 custom-nav-btn">
                        Available Times Management
                    </Button>
                    <Button as={Link} to="/admin/data-management" variant="outline-primary" className="me-3 custom-nav-btn">
                        Data Management
                    </Button>
                    <Button as={Link} to="/admin/chat" variant="outline-primary" className="me-3 custom-nav-btn">
                        Admin Chat
                    </Button>
                    <Button variant="outline-secondary" onClick={() => navigate(-1)} className="custom-back-btn">
                        ← Back
                    </Button>
                </Col>
            </Row>

            {loading ? (
                <div className="d-flex justify-content-center my-5">
                    <Spinner animation="border" />
                </div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <Table striped bordered className="shadow-sm bg-white rounded">
                    <thead className="bg-light text-dark">
                        <tr>
                            <th>#</th>
                            <th>User Email</th>
                            <th>Service</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Car Model</th>
                            <th>License Plate</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservations.length > 0 ? (
                            reservations.map((res, index) => (
                                <tr key={res.id}>
                                    <td>{index + 1}</td>
                                    <td>{res.user_email}</td>
                                    <td>{res.service_type}</td>
                                    <td>{res.date}</td>
                                    <td>{res.time}</td>
                                    <td>{res.status}</td>
                                    <td>{res.car_model || '-'}</td>
                                    <td>{res.license_plate || '-'}</td>
                                    <td>
                                        <Button
                                            variant="outline-success"
                                            size="sm"
                                            onClick={() => handleUpdateStatus(res.id, 'Confirmed')}
                                            className="me-2 custom-action-btn"
                                        >
                                            Confirm
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleUpdateStatus(res.id, 'Cancelled')}
                                            className="custom-action-btnr"
                                        >
                                            Cancel
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="text-center">No reservations found.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}
        </Container>
    );
}


export default AdminDashboard;
