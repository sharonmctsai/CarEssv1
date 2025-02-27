// UserDashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Alert, Table, Spinner, Badge } from 'react-bootstrap';
import { Link ,useNavigate} from 'react-router-dom';
import { FaCalendarCheck, FaClock, FaHistory, FaTimesCircle, FaSignOutAlt,FaUserEdit, FaArrowLeft, FaCalendarPlus} from 'react-icons/fa';
import { UserContext } from '../context/UserContext';
import './UserDashboard.css';  // Import the new CSS file
import { FaBell } from 'react-icons/fa';

function UserDashboard() {
    const { user,setUser } = useContext(UserContext);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);

    // 取得「未來或當天」的預約紀錄（history=0）
    useEffect(() => {
        if (user?.email) {
            fetch(`http://localhost:5002/api/reservations?email=${user.email}&history=0`)
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


const handleAddToCalendar = (reservationId) => {
      
    fetch(`http://localhost:5002/api/add-to-google-calendar/${reservationId}`)
        .then((res) => res.json())
        .then((data) => {
            if (data.calendar_url) {
                // Log the calendar URL to the console
                console.log(data.calendar_url);

                //  can optionally open the URL in a new tab as well
                window.open(data.calendar_url, "_blank");
            } else {
                console.error("Failed to get calendar URL");
            }
        })
        .catch((err) => {
            console.error("Error occurred while adding to Google Calendar:", err);
        });
};

useEffect(() => {
    if (user?.email) {
        fetch(`http://localhost:5002/api/reservations?email=${user.email}&history=1`)
            .then((res) => res.json())
            .then((data) => {
                console.log("History Data:", data);
                setHistory(data);
            })
            .catch(() => console.error("Failed to load reservation history"));
    }
}, [user?.email]);



    // 取消預約
    const handleCancelReservation = (id) => {
        fetch(`http://localhost:5002/api/cancel-reservation/${id}`, {
            method: 'DELETE',
        })
            .then((res) => {
                if (res.ok) {
                    // 從前端狀態中過濾掉已取消的預約
                    setReservations(reservations.filter((r) => r.id !== id));
                    alert('Reservation cancelled successfully.');
                } else {
                    alert('Failed to cancel reservation.');
                }
            })
            .catch((err) => alert('Network error. Please try again.'));
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

                    <Button variant="info" as={Link} to="/notifications" className="shadow">
                            <FaBell className="me-2" /> Notifications
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
                                        <th>Car Model</th>
                                        <th>License Plate</th>
                                        <th>Status</th>
                                        <th>Reminder</th>
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
                                            <td>{res.car_model || '-'}</td>
                                            <td>{res.license_plate || '-'}</td>
                                            <td>
                                        <Badge 
                                            className={`bg-${res.status === 'Pending' ? 'warning text-dark' : 
                                                            res.status === 'Cancelled' ? 'danger' : 
                                                            'success'}`}
                                        >
                                            {res.status}
                                        </Badge>
                                    </td>

                                
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handleAddToCalendar(res.id)}
                                                className="shadow-sm"
                                            >        <FaCalendarPlus className="me-1" />

                                                Add to Google Calendar
                                            </Button>



                                            <td>
                                                {/* 編輯預約按鈕 -> 跳轉至 /edit-reservation/:id */}
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    as={Link}
                                                    to={`/edit-reservation/${res.id}`}
                                                    className="me-2 shadow-sm"
                                                >
                                                    Edit
                                                </Button>
                                                {/* 取消預約按鈕 */}
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
                                No upcoming reservations found.{' '}
                                <Link to="/reservation" className="text-primary">
                                    Make your first reservation now!
                                </Link>
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
                                <th>Car Model</th>
                                <th>License Plate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((res, index) => (
                                    <tr key={res.id}>
                                        <td>{index + 1}</td>
                                        <td>{res.service_type}</td>
                                        <td>{res.date}</td>
                                        <td>{res.time}</td>
                                        <td>{res.status}</td>
                                        <td>{res.car_model}</td>
                                        <td>{res.license_plate}</td>
                                        <td><FaClock className="me-1" /> {res.time}</td>
                                        <td>
                                            <Badge 
                                            className={`bg-${res.status === 'Pending' ? 'warning text-dark' : 
                                                            res.status === 'Cancelled' ? 'danger' : 
                                                            'success'}`}
                                        >
                                            {res.status}
                                        </Badge>
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
