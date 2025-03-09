import React from "react";
import { useNavigate } from "react-router-dom";
import "./About.css"; // Add a CSS file for styling
import { FaInstagram, FaFacebook } from 'react-icons/fa'; // Import the icons

const About = () => {
    const navigate = useNavigate();

    return (
        <div className="about-section">
            <h1>About Us</h1>
            <p>
                Welcome to <strong> CarEss</strong>, where we provide high-quality car servicing and maintenance.
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
            <p>Tel :0800-123-4567</p>            
            <p>Time :Mon- Sat 08:00 -18:00</p>

            <h2>Follow Us</h2>
            <p>
                Stay connected with us on social media:
                <br />
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                    <FaInstagram size={30} /> {/* Instagram Icon */}
                </a>
                &nbsp;|&nbsp;
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                    <FaFacebook size={30} /> {/* Facebook Icon */}
                </a>
            </p>


            <button className="btn-back" onClick={() => navigate("/")}>Back to Home</button>

        </div>
    );
};

export default About;
