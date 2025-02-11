import React from "react";
import { useNavigate } from "react-router-dom";
import "./About.css"; // Add a CSS file for styling

const About = () => {
    const navigate = useNavigate();

    return (
        <div className="about-section">
            <h1>About Us</h1>
            <p>
                Welcome to <strong>[Your Company Name]</strong>, where we provide high-quality car servicing and maintenance.
                Our goal is to keep your vehicle running smoothly with expert diagnostics, repairs, and routine checkups.
            </p>

            <h2>Our Services</h2>
            <ul>
                <li>Full Car Servicing & Maintenance</li>
                <li>Engine Diagnostics & Repairs</li>
                <li>Oil & Fluid Changes</li>
                <li>Brake & Suspension Inspections</li>
                <li>Tyre Replacement & Wheel Alignment</li>
                <li>Air Conditioning Maintenance</li>
            </ul>

            <h2>Why Choose Us?</h2>
            <p>
                With experienced professionals, advanced technology, and a customer-first approach, we ensure that your car
                gets the best care possible.
            </p>


            <h2>Contact Us</h2>
            <p>Address : 1 AA road, Co. Dublin, Ireland</p>
            <p>Email : support@caress.com</p>
            <p>0800-123-4567</p>
            <button className="btn-back" onClick={() => navigate("/")}>Back to Home</button>

        </div>
    );
};

export default About;
