import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard"; 
import UploadCredit from "./pages/UploadCert.js"; // Adjust path as needed
import AuthenticateCredit from "./pages/AuthenticateCredit.js";

// import PersonalCarbon from "./pages/PersonalCarbon";
// import ListCredits from "./pages/ListCredits";
// import Learn from "./pages/Learn";
// import Connect from "./pages/Connect";
import LoginRegisterPage from "./pages/LoginRegisterPage";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginRegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadCredit />} />
        <Route path="/authentication" element={<AuthenticateCredit />} />

        {/* <Route path="/personal-carbon" element={<PersonalCarbon />} />
        <Route path="/list-credits" element={<ListCredits />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/connect" element={<Connect />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
