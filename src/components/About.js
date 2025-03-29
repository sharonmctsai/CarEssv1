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
            <p><strong>Address:</strong> Cork Rd, Kilbarry, Waterford, Ireland</p>
            <p><strong>Email:</strong> support@caress.com</p>
            <p><strong>Tel:</strong> 0800-123-4567</p>            
            <p><strong>Time:</strong> Mon-Sun 08:00 - 18:00</p>

            {/* Google Map Embed */}
            <div className="map-container">
    <iframe
        title="SETU Waterford Location"
        width="100%"
        height="300"
        style={{ border: 0, borderRadius: "10px" }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2381.1382878293696!2d-7.137318123303369!3d52.24544377191202!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4842c41e4b5fa3ff%3A0x8c39602f5c5a27d7!2sSETU%20Waterford!5e0!3m2!1sen!2sie!4v1710000000000"
    ></iframe>
</div>



            {/* Google Review Link */}
            <h2>Leave a Review</h2>
            <p>
                We value your feedback! Click below to leave us a review on Google.
            </p>
            <a
                href="https://search.google.com/local/writereview?placeid=ChIJMUHdEBPEQkgR_nw_8dzwQkA"
                target="_blank"
                rel="noopener noreferrer"
                className="review-button"
            >
                Leave a Review ⭐
            </a>

            <h2>Follow Us</h2>
            <p>
                Stay connected with us on social media:
                <br />
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                    <FaInstagram size={30} />
                </a>
                &nbsp;|&nbsp;
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                    <FaFacebook size={30} />
                </a>
            </p>

            <button className="btn-back" onClick={() => navigate("/")}>Back to Home</button>
        </div>
    );
};

export default About;
