import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/HomePage.css";
import axios from "axios";
import { Link } from "react-router-dom";

const functions = [
  { title: "Verify Credits", desc: "Authenticates carbon credit certificates using AI and OCR." },
  { title: "Decentralized Storage", desc: "Stores certificates securely on IPFS for immutability." },
  { title: "Generate Metadata", desc: "Creates verifiable metadata for every carbon project." },
  { title: "Blockchain Integration", desc: "Registers authenticated data on Hyperledger Fabric." },
];

const team = [
  { name: "Aanchal Das", img: "/team/1.jpg" },
  { name: "Manya", img: "/team/2.jpg" },
  { name: "Shanvi", img: "/team/3.jpg" },
];

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const scrollToFunctions = () => {
    document.getElementById("functions")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAuthSubmit = async () => {
    setError(""); setSuccess("");
    if (!email || !password) {
      setError("All fields are required.");
      return;
    }
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      setSuccess("Login successful!");
    } catch (err) {
      setError("Authentication failed. Please check your credentials.");
    }
  };

  return (
    <div className="home-container container-fluid p-0">
      {/* Navbar */}
      <nav className="home-navbar navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          <a className="navbar-brand text-success fw-bold" href="#">GreenCredit</a>
          <div className="ms-auto d-flex gap-3 align-items-center">
            <Link to="/login" className="home-login-btn btn btn-outline-success">Login / Register</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
    <div className="homepage-hero fade-in">
  <img src="/bg-animated.svg" alt="animated background" />
  <div className="hero-content">
    <h1 className="display-4 fw-bold mb-3">Buy Carbon Credits, Green Credits</h1>
    <p className="lead mb-4">Empowering Sustainable Choices Through Verified Carbon Credits</p>
    <button className="btn btn-success btn-lg" onClick={scrollToFunctions}>Explore</button>
  </div>
</div>

      {/* What We Do */}
      <section id="functions" className="home-functions-section py-5 px-3 fade-in">
        <h2 className="home-section-title text-center text-success mb-5 fs-3">What Does GreenCredit Do?</h2>
        <div className="row g-4 justify-content-center">
          {functions.map((item, idx) => (
            <div key={idx} className="home-function-card col-sm-6 col-lg-3">
              <div className="card shadow-lg h-100 text-center p-4 hover-up">
                <h5 className="text-success mb-3">{item.title}</h5>
                <p className="home-desc" style={{ color: 'var(--cream-text)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="home-team-section py-5 px-3 fade-in">
        <h2 className="home-section-title text-center text-success mb-5 fs-3">Meet the Team</h2>
        <div className="row g-4 justify-content-center">
          {team.map((member, idx) => (
            <div key={idx} className="home-team-card col-6 col-md-3">
              <div className="card text-center shadow-sm p-3 hover-up">
                <img src={member.img} className="rounded-circle mx-auto mb-3" alt={member.name}
                  style={{ width: "120px", height: "120px", objectFit: "cover" }} />
                <h6 className="text-success">{member.name}</h6>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="home-testimonial-section py-5 px-3 fade-in">
        <h2 className="text-center text-success mb-4">What People Are Saying</h2>
        <div id="testimonialCarousel" className="carousel slide text-center" data-bs-ride="carousel">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <p className="lead">“GreenCredit simplified how we verify carbon projects. Brilliant system.”</p>
              <strong>- EcoOrg CEO</strong>
            </div>
            <div className="carousel-item">
              <p className="lead">“Seamless integration with blockchain gives us confidence in every credit.”</p>
              <strong>- Sustainability Analyst</strong>
            </div>
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" />
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon" />
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="home-stats-section py-5 text-center fade-in">
        <div className="container">
          <div className="row">
            <div className="col">
              <h3 className="text-success">100+</h3>
              <p>Projects Verified</p>
            </div>
            <div className="col">
              <h3 className="text-success">500K+</h3>
              <p>Credits Registered</p>
            </div>
            <div className="col">
              <h3 className="text-success">30+</h3>
              <p>Organizations Onboarded</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer bg-white text-center py-4 border-top text-muted fade-in">
        &copy; {new Date().getFullYear()} GreenCredit. Made with purpose.
      </footer>

      {/* Login/Register Modal */}
      {showModal && (
        <div className="home-modal modal fade-in d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content p-4">
              <h5 className="modal-title text-success mb-3">Login / Register</h5>
              {error && <div className="alert alert-danger py-1">{error}</div>}
              {success && <div className="alert alert-success py-1">{success}</div>}
              <input
                type="email"
                className="form-control mb-3"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                className="form-control mb-3"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="btn btn-success w-100 mb-2" onClick={handleAuthSubmit}>
                Submit
              </button>
              <button className="btn btn-outline-secondary w-100" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
