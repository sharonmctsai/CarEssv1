// DataManagement.js
import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaSyncAlt, FaArrowLeft, FaPlus, FaMinus } from 'react-icons/fa';

function DataManagement() {
  const [customers, setCustomers] = useState([]);
  const [serviceItems, setServiceItems] = useState([]);
  const [newServiceItem, setNewServiceItem] = useState({ name: '', description: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); 

  // get user details
  useEffect(() => {
    fetch('http://localhost:5002/api/customers')
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(err => console.error(err));
  }, []);

  // get service details
  useEffect(() => {
    fetch('http://localhost:5002/api/service-items')
      .then(res => res.json())
      .then(data => setServiceItems(data))
      .catch(err => console.error(err));
  }, []);

  const deleteCustomer = async (id) => {
    try {
      const response = await fetch(`http://localhost:5002/api/customers/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setCustomers(customers.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteServiceItem = async (id) => {
    try {
      const response = await fetch(`http://localhost:5002/api/service-items/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setServiceItems(serviceItems.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addServiceItem = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5002/api/service-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newServiceItem)
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        // fetch and read service items
        fetch('http://localhost:5002/api/service-items')
          .then(res => res.json())
          .then(data => setServiceItems(data));
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('Network error');
    }
  };

  return (
    <Container className="my-5">
      <h2>Data Management</h2>
      {message && <Alert variant="info">{message}</Alert>}

      <h3>Customers</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>
              <Button variant="danger" size="sm" onClick={() => deleteCustomer(c.id)}>
    <FaMinus className="me-2" /> Delete
</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h3>Service Items</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {serviceItems.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td>
              <Button variant="danger" size="sm" onClick={() => deleteServiceItem(item.id)}>
    <FaMinus className="me-2" /> Delete
</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h3>Add Service Item</h3>
      <Form onSubmit={addServiceItem}>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={newServiceItem.name}
            onChange={(e) => setNewServiceItem({ ...newServiceItem, name: e.target.value })}
            required
            style={{ color: 'black' }}  

          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="text"
            value={newServiceItem.description}
            onChange={(e) => setNewServiceItem({ ...newServiceItem, description: e.target.value })}
            style={{ color: 'black' }}  // Keep text black

         />
        </Form.Group>
        <Button type="submit">
    <FaPlus className="me-2" /> Add Service Item
</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}> 
        <FaArrowLeft className="me-2" />
        Back
        </Button> {/* Navigate to the previous page */}

      </Form>
    </Container>
  );
}

export default DataManagement;
