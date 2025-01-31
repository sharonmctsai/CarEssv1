import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Alert, Table, Spinner, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaCalendarCheck, FaClock, FaHistory, FaTimesCircle, FaSignOutAlt,FaUserEdit, FaArrowLeft} from 'react-icons/fa';
import { UserContext } from '../context/UserContext';
import './UserDashboard.css';  // Import the new CSS file

function UserDashboard() {
    const { user, setUser } = useContext(UserContext);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (user?.email) {
            fetch(`http://localhost:5002/api/reservations?email=${user.email}`)
                .then((res) => res.json())
                .then((data) => {
                    setReservations(data);
                    setLoading(false);
                })
                .catch(() => {
                    setError('Failed to load reservations');
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [user?.email]);

    useEffect(() => {
        if (user?.email) {
            fetch(`http://localhost:5002/api/history?email=${user.email}`)
                .then((res) => res.json())
                .then((data) => {
                    console.log("History Data:", data);  // Debugging log
                    setHistory(data);
                })
                .catch(() => console.error("Failed to load reservation history"));
        }
    }, [user?.email]);
    

    const handleCancelReservation = (id) => {
        fetch(`http://localhost:5002/api/cancel-reservation/${id}`, { method: 'DELETE' })
            .then((res) => {
                if (res.ok) {
                    setReservations(reservations.filter((r) => r.id !== id));
                    alert('Reservation cancelled successfully.');
                } else {
                    alert('Failed to cancel reservation.');
                }
            })
            .catch(() => alert('Network error. Please try again.'));
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <Container className="dashboard-content">
                {/* Welcome Message */}
                <Row className="mb-4">
                    <Col>
                        <Card className="dashboard-card welcome-card">
                            <Card.Body>
                                <h2>Welcome back, {user?.name || 'Guest'}!</h2>
                                <p>Your email: {user?.email || 'guest@example.com'}</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col className="text-end">
                        <Button as={Link} to="/reservation" className="neon-reserve">
                            <FaCalendarCheck className="me-2" /> Make a Reservation
                        </Button>
                       
                        {/* Profile Button in Dashboard */}
                <Button as={Link} to="/profile" className="neon-profile ">
                    <FaUserEdit className="me-2" /> Profile
                </Button>

                <Button onClick={handleLogout} className="neon-logout">
                            <FaSignOutAlt className="me-2" /> Logout
                        </Button>
                  {/* Back to Dashboard Button */}
                  <Button className="btn neon-back mt-3" onClick={() => navigate("/")}>
                        <FaArrowLeft className="me-2" /> Homepage
                    </Button>

                    </Col>
                </Row>

                {/* Upcoming Reservations */}
                <Row className="mb-4">
                    <Col>
                        <h3 className="text-light">Your Upcoming Reservations</h3>
                        {loading ? (
                            <div className="text-center my-3">
                                <Spinner animation="border" variant="light" />
                            </div>
                        ) : error ? (
                            <Alert variant="danger">{error}</Alert>
                        ) : reservations.length > 0 ? (
                            <Table striped bordered hover className="shadow-sm bg-dark text-white">
                                <thead className="table-dark">
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
                                            <td><FaClock className="me-1" /> {res.time}</td>
                                            <td>
                                                <Badge bg={res.status === 'Pending' ? 'warning' : 'success'}>
                                                    {res.status}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button variant="outline-danger" size="sm"
                                                    onClick={() => handleCancelReservation(res.id)}
                                                    className="shadow-sm">
                                                    <FaTimesCircle className="me-1" /> Cancel
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <Alert variant="info">
                                No upcoming reservations found.{" "}
                                <Link to="/reservation" className="text-primary">Make your first reservation now!</Link>
                            </Alert>
                        )}
                    </Col>
                </Row>
            {/* Reservation History */}
            <Row className="mb-4">
                <Col>
                    <h3 className="text-light">Your Reservation History</h3>
                    {history.length > 0 ? (
                        <Table striped bordered hover className="shadow-sm bg-dark text-white">
                            <thead className="table-dark">
                                <tr>
                                    <th>#</th>
                                    <th>Service</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((res, index) => (
                                    <tr key={res.id}>
                                        <td>{index + 1}</td>
                                        <td>{res.service_type}</td>
                                        <td>{res.date}</td>
                                        <td><FaClock className="me-1" /> {res.time}</td>
                                        <td>
                                            <Badge bg="secondary">{res.status}</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <Alert variant="info">
                            No past reservations found.
                        </Alert>
                    )}
                </Col>
            </Row>

            </Container>
        </div>
    );
}

export default UserDashboard;
