import React, { useState, useContext } from "react";
import { Container, Card, Button, Form } from "react-bootstrap";
import { FaUserEdit, FaSave, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "./UserProfile.css";


function UserProfile() {
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        password: "",
        profilePic: user?.profilePic || "https://via.placeholder.com/120",
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProfileUpdate = () => {
        if (!formData.email.includes("@")) {
            alert("Please enter a valid email address.");
            return;
        }
        if (formData.password && formData.password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }
   
        // Simulate an API call (Replace with backend logic)
        const updatedUser = { ...user, name: formData.name, email: formData.email };
        if (formData.password) {
            updatedUser.password = formData.password;
        }
   
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser)); // Store in localStorage
        setIsEditing(false);
        alert("Profile updated successfully!");
    };
   

    return (
        <div className="profile-container">
            <Container>
                <Card className="profile-card">
                    <img src={formData.profilePic} alt="Profile" className="profile-img" />
                    
                    {isEditing ? (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>New Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    placeholder="Enter new password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Button className="btn neon-save" onClick={handleProfileUpdate}>
                                <FaSave className="me-2" /> Save Changes
                            </Button>
                        </>
                    ) : (
                        <>
                            <h3>{user?.name || "Guest"}</h3>
                            <p>{user?.email || "guest@example.com"}</p>
                            <Button className="btn neon-edit" onClick={() => setIsEditing(true)}>
                                <FaUserEdit className="me-2" /> Edit Profile
                            </Button>
                        </>
                    )}
                    
                    {/* Back to Dashboard Button */}
                    <Button className="btn neon-back mt-3" onClick={() => navigate("/dashboard")}>
                        <FaArrowLeft className="me-2" /> Back to Dashboard
                    </Button>
                </Card>
            </Container>
        </div>
    );
}

export default UserProfile;
