import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Alert, Table, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCalendarCheck, FaClock, FaHistory, FaTimesCircle } from 'react-icons/fa';
import { UserContext } from '../context/UserContext'; // 引入 UserContext

function UserDashboard() {
    const { user } = useContext(UserContext); // 從全局上下文獲取用戶信息
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user?.email) {
            // Fetch user's reservations
            fetch(`http://localhost:5002/api/reservations?email=${user.email}`)
                .then((res) => res.json())
                .then((data) => {
                    setReservations(data);
                    setLoading(false);
                })
                .catch((err) => {
                    setError('Failed to load reservations');
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [user?.email]);

    const handleCancelReservation = (id) => {
        // Handle reservation cancellation
        fetch(`http://localhost:5002/api/cancel-reservation/${id}`, {
            method: 'DELETE',
        })
            .then((res) => {
                if (res.ok) {
                    setReservations(reservations.filter((r) => r.id !== id));
                    alert('Reservation cancelled successfully.');
                } else {
                    alert('Failed to cancel reservation.');
                }
            })
            .catch((err) => alert('Network error. Please try again.'));
    };

    return (
        <div className="user-dashboard" style={styles.background}>
            <Container className="my-5">
                {/* Welcome Message */}
                <Row className="mb-4">
                    <Col>
                        <Card className="p-4 shadow-lg text-white" style={styles.cardPrimary}>
                            <h2>Welcome back, {user?.name || 'Guest'}!</h2>
                            <p>Your email: {user?.email || 'guest@example.com'}</p>
                        </Card>
                    </Col>
                    <Col className="text-end">
                        <Button variant="success" as={Link} to="/reservation" className="shadow">
                            <FaCalendarCheck className="me-2" /> Make a New Reservation
                        </Button>
                    </Col>
                </Row>

                {/* Upcoming Reservations */}
                <Row className="mb-4">
                    <Col>
                        <h3 className="text-primary">Your Upcoming Reservations</h3>
                        {loading ? (
                            <div className="d-flex justify-content-center my-3">
                                <Spinner animation="border" />
                            </div>
                        ) : error ? (
                            <Alert variant="danger">{error}</Alert>
                        ) : reservations.length > 0 ? (
                            <Table striped bordered hover className="shadow-sm bg-white">
                                <thead className="bg-dark text-white">
                                    <tr>
                                        <th>#</th>
                                        <th>Service</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservations.map((res, index) => (
                                        <tr key={res.id}>
                                            <td>{index + 1}</td>
                                            <td>{res.service_type}</td>
                                            <td>{res.date}</td>
                                            <td>
                                                <FaClock className="me-1" />
                                                {res.time}
                                            </td>
                                            <td>
                                                <Badge bg={res.status === 'Pending' ? 'warning' : 'success'}>
                                                    {res.status}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleCancelReservation(res.id)}
                                                    className="shadow-sm"
                                                >
                                                    <FaTimesCircle className="me-1" />
                                                    Cancel
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <Alert variant="info">
                                No upcoming reservations found.{" "}
                                <Link to="/reservation" className="text-primary">
                                    Make your first reservation now!
                                </Link>
                            </Alert>
                        )}
                    </Col>
                </Row>

                {/* History Section */}
                <Row>
                    <Col>
                        <h3 className="text-primary">Your Reservation History</h3>
                        <Card className="shadow-lg p-4 bg-light">
                            <Card.Body className="d-flex justify-content-between align-items-center">
                                <p className="mb-0">
                                    <FaHistory className="me-2 text-secondary" />
                                    See all your past reservations.
                                </p>
                                <Button variant="outline-secondary" as={Link} to="/history" className="shadow-sm">
                                    View History
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

const styles = {
    background: {
        background: "linear-gradient(to bottom, #f9f9f9, #e8e8e8)",
        minHeight: "100vh",
        padding: "20px 0",
    },
    cardPrimary: {
        background: "linear-gradient(to right, #4facfe, #00f2fe)",
        border: "none",
    },
};

export default UserDashboard;
