import React, { useState } from 'react';
import { Link,useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Card, Row, Col, Modal } from 'react-bootstrap';
import { FaCarSide, FaTools, FaRoad, FaTachometerAlt, FaOilCan, FaBatteryFull, FaPaintBrush, FaTint,FaCog } from 'react-icons/fa';
import './Home.css';
import "bootstrap/dist/css/bootstrap.min.css";

function Home() {
  const storedUser = JSON.parse(localStorage.getItem("user")) || {}; 
  const username = storedUser.name || "Guest";

  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const location = useLocation();

  const services = [
    { id: 1, title: "Pre And Post NCT", icon: <FaRoad size={50} className="mb-3 icon-primary" />, description: "A Pre NCT is a vehicle check completed before a National Car Test.", price: "€50" },
    { id: 2, title: "Car Servicing", icon: <FaTools size={50} className="mb-3 icon-primary" />, description: "We provide top-notch maintenance service for all types of vehicles.", price: "€100" },
    { id: 3, title: "Wheel Repair", icon: <FaCog size={50} className="mb-3 icon-primary" />, description: "Professional wheel repair services to restore your wheels to their original condition.", price: "€70" },
    { id: 4, title: "New Tyres", icon: <FaCarSide size={50} className="mb-3 icon-primary" />, description: "We offer high-quality tyres for all vehicle types at competitive prices.", price: "€150" },
    { id: 5, title: "Oil Change", icon: <FaOilCan size={50} className="mb-3 icon-primary" />, description: "Get an oil change to keep your engine running smoothly and efficiently.", price: "€40" },
    { id: 6, title: "Car Battery Replacement", icon: <FaBatteryFull size={50} className="mb-3 icon-primary" />, description: "Replace your old car battery with a new, high-performance battery.", price: "€120" },
    { id: 7, title: "Spray Painting", icon: <FaPaintBrush size={50} className="mb-3 icon-primary" />, description: "Professional spray painting services to restore your car’s paint finish.", price: "€150" },
    { id: 8, title: "Brake Fluid Change", icon: <FaTint size={50} className="mb-3 icon-primary" />, description: "We change brake fluid to maintain braking efficiency and safety.", price: "€60" },
    { id: 9, title: "Clutch Replacement", icon: <FaTachometerAlt size={50} className="mb-3 icon-primary" />, description: "Complete clutch replacement to ensure smooth gear shifting.", price: "€300" },

  ];

  const handleShowModal = (service) => {
    setSelectedService(service);
    setShowModal(true);
  };

  return (
    <>
      {/* Navigation */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">CarEss</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {username !== 'Guest' ? (
                <>
                  <Nav.Link disabled style={{ color: 'yellow' }}>Hello, {username}</Nav.Link>
                  <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                  <Nav.Link as={Link} to="/reservation">Reservation</Nav.Link>
                  <Nav.Link as={Link} to="/chat">Chat</Nav.Link>
                  <Nav.Link as={Link} to="/about">About/ Contact</Nav.Link>

                  <Nav.Link as={Link} to="/" onClick={() => { localStorage.removeItem("user"); window.location.reload(); }}>
                    Logout
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/about">About/ Contact</Nav.Link>
                  <Nav.Link as={Link} to="/register">Register</Nav.Link>
                  <Nav.Link as={Link} to="/login">Log In</Nav.Link>
                  <Nav.Link as={Link} to="/admin-login">Admin</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <div className="hero-section">
  <Container className="text-center text-white">
    <h1 className="display-4">Welcome to CarEss</h1>
    <p className="lead">"Booking Made Easy, Service Made Right."</p>
    <div className="mt-4">
      {username === 'Guest' ? (
        <>
          <Button variant="primary" size="lg" as={Link} to="/register" className="mx-2">
            Register
          </Button>
          <Button variant="secondary" size="lg" as={Link} to="/login" className="mx-2">
            Log In
          </Button>
        </>
      ) : (
        <p className="lead">Welcome back, {username}!</p>
      )}
    </div>
  </Container>
</div>


      {/* Services Section */}
      <Container className="my-5">
        <h2 className="text-center mb-4">Our Services</h2>
        <Row>
          {services.map(service => (
            <Col md={4} className="mb-4" key={service.id}>
              <Card className="h-100 text-center" onClick={() => handleShowModal(service)} style={{ cursor: 'pointer' ,backgroundColor: '#747EA8'}}>
                <Card.Body>
                  {service.icon}
                  <Card.Title>{service.title}</Card.Title>
                  <Card.Text>{service.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Service Modal */}
   {/* Stylish Service Modal */}
<Modal 
  show={showModal} 
  onHide={() => setShowModal(false)} 
  centered 
  className="custom-modal"
>
  <Modal.Header closeButton className="modal-header-custom">
    <Modal.Title>{selectedService?.title}</Modal.Title>
  </Modal.Header>
  <Modal.Body className="modal-body-custom">
    <p>{selectedService?.description}</p>
    <h5 className="price-text">Price: <strong>{selectedService?.price}</strong></h5>
  </Modal.Body>
  <Modal.Footer className="modal-footer-custom">
    <Button variant="secondary" onClick={() => setShowModal(false)} className="close-btn">
      Close
    </Button>
    {storedUser?.name ? (
      <Button variant="primary" as={Link} to="/reservation" className="book-btn">
        Book Now
      </Button>
    ) : (
      <p className="log-text">Please log in to book a service.</p>
    )}
  </Modal.Footer>
</Modal>


      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3">
        &copy; {new Date().getFullYear()} CarEss. All rights reserved.
      </footer>
    </>
  );
}

export default Home;
