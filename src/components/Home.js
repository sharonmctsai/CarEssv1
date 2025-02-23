import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Card, Row, Col } from 'react-bootstrap';
import { FaCarSide, FaTools, FaBell } from 'react-icons/fa'; // using React Icons
import './Home.css'; // create css individually for design
import "bootstrap/dist/css/bootstrap.min.css";

function Home() {
  const location = useLocation();
  // Retrieve and parse stored user data
  const storedUser = JSON.parse(localStorage.getItem("user")) || {}; 
  const username = storedUser.name || "Guest"; // Extract only the name

  console.log("User:", username); // Debugging
  
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
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/reservation">Reservation</Nav.Link>
                <Nav.Link as={Link} to="/about">About</Nav.Link>
                <Nav.Link disabled style={{ color: 'white' }}>Hello, {username}</Nav.Link>

                <Nav.Link as={Link} to="/" onClick={() => { localStorage.removeItem("user"); window.location.reload(); }}>
              Logout
                 </Nav.Link>


                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/register">Register</Nav.Link>
                  <Nav.Link as={Link} to="/login">Log In</Nav.Link>
                  <Nav.Link as={Link} to="/admin-login">Admin</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero  */}
      <div className="hero-section d-flex align-items-center">
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

      {/* Services */}
      <Container className="my-5">
        <h2 className="text-center mb-4">Our Services</h2>
        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <FaCarSide size={50} className="mb-3 text-primary" />
                <Card.Title>Pre And Post NCT</Card.Title>
                <Card.Text>
                  A Pre NCT is a vehicle check completed before a National Car Test
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <FaTools size={50} className="mb-3 text-primary" />
                <Card.Title>Car Servicing</Card.Title>
                <Card.Text>
                  We provide top notch maintenance service for all types of vehicles
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <FaBell size={50} className="mb-3 text-primary" />
                <Card.Title>Schedule Service</Card.Title>
                <Card.Text>
                  Easily schedule your car’s service or test with just a few clicks
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3">
        &copy; {new Date().getFullYear()} CarEss. All rights reserved.
      </footer>
    </>
  );
}


export default Home;
