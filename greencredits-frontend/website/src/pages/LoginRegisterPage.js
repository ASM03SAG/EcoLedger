import React, { useState } from "react";
import "./styles/LoginRegisterPage.css";
import { useNavigate } from "react-router-dom";

export default function LoginRegisterPage() {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const navigate = useNavigate();

  const toggleToSignUp = () => setIsRightPanelActive(true);
  const toggleToSignIn = () => setIsRightPanelActive(false);

  const handleSignIn = (e) => {
    e.preventDefault();
    // TODO: Replace with actual login API call
    console.log("Login successful!");
    navigate("/dashboard");
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    // TODO: Replace with actual register API call
    console.log("Registration successful!");
    navigate("/dashboard");
  };

  return (
    <div className={`login-container login-main-container ${isRightPanelActive ? "login-right-panel-active" : ""}`} id="login-container">
      
      {/* Sign Up Form */}
      <div className="login-form-container login-sign-up-container">
        <form onSubmit={handleSignUp}>
          <h1 className="login-title text-darker-green">Create Account</h1>
          <span className="login-subtitle">Use your email for registration</span>
          <input type="text" placeholder="Name" className="login-input" />
          <input type="email" placeholder="Email" className="login-input" />
          <input type="password" placeholder="Password" className="login-input" />
          <button type="submit" className="login-button">Sign Up</button>
        </form>
      </div>

      {/* Sign In Form */}
      <div className="login-form-container login-sign-in-container">
        <form onSubmit={handleSignIn}>
          <h1 className="login-title text-darker-green">Sign in</h1>
          <span className="login-subtitle">Use your account</span>
          <input type="email" placeholder="Email" className="login-input" />
          <input type="password" placeholder="Password" className="login-input" />
          <a href="#" className="login-forgot">Forgot your password?</a>
          <button type="submit" className="login-button">Sign In</button>
        </form>
      </div>

      {/* Overlay Panel */}
      <div className="login-overlay-container">
        <div className="login-overlay">
          <div className="login-overlay-panel login-overlay-left">
            <h1 className="login-title text-darker-green">Welcome Back!</h1>
            <p className="login-subtitle">To stay connected, please log in with your personal info</p>
            <button className="login-button ghost" onClick={toggleToSignIn}>Sign In</button>
          </div>
          <div className="login-overlay-panel login-overlay-right">
            <h1 className="login-title text-darker-green">Hello, Friend!</h1>
            <p className="login-subtitle">Enter your details and start your journey with us</p>
            <button className="login-button ghost" onClick={toggleToSignUp}>Sign Up</button>
          </div>
        </div>
      </div>
    </div>
  );
}
