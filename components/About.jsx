import React from 'react';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-card">
        <div className="about-logo">
          <span className="about-paw">🐾</span>
          <div>
            <h1 className="about-title">PatiHouse Pet Shop</h1>
            <p className="about-subtitle">Happy paws, trusted products.</p>
          </div>
        </div>

        <p>
          PatiHouse Pet Shop is an Istanbul-based online pet store dedicated to the health,
          comfort, and happiness of your companions. We carefully select high-quality food,
          accessories, toys, and care products for cats, dogs, birds, and fish, working only
          with trusted and animal-friendly brands.
        </p>

        <p>
          Our mission is to make pet care easier, safer, and more accessible. With our curated
          categories — Food, Collars &amp; Walking, Bowls &amp; Feeders, Toys, Care &amp; Hygiene,
          and Treats &amp; Snacks — we offer everything your pet needs in one place.
        </p>

        <p>
          We currently accept orders through our website. We provide
          <strong> same-day delivery within Istanbul</strong> and
          <strong> fast shipping to other cities in Türkiye</strong>.
        </p>

        <div className="about-contact">
          <h2>Contact</h2>
          <div className="about-contact-grid">
            <div className="about-contact-item">
              <span className="label">Phone</span>
              <span className="value">+90 (216) 123 45 67</span>
            </div>
            <div className="about-contact-item">
              <span className="label">E-mail</span>
              <span className="value">info@patihouse.com</span>
            </div>
            <div className="about-contact-item">
              <span className="label">Address</span>
              <span className="value">Tuzla, Istanbul, Türkiye</span>
            </div>
            <div className="about-contact-item">
              <span className="label">Working Hours</span>
              <span className="value">Every day, 09:00 – 21:00</span>
            </div>
          </div>
        </div>

        <p className="about-footnote">
          All products are 100% original and securely packaged. Customer satisfaction and animal
          welfare are at the heart of everything we do.
        </p>
      </div>
    </div>
  );
};

export default About;

