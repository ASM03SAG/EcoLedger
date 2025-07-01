import React, { useState } from "react";
import "./styles/Dashboard.css";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [selectedTab, setSelectedTab] = useState("carbon");
  const [selectedToggle, setSelectedToggle] = useState("owned");
  const [aiDropdownOpen, setAiDropdownOpen] = useState(false);

  const ownedCredits = [
    { id: "CRC001", type: "Forestry", volume: 1500, status: "Active", date: "2023-01-15" },
    { id: "CRC003", type: "Waste Management", volume: 500, status: "Retired", date: "2022-11-01" },
  ];

  const marketCredits = [
    { id: "CRC007", type: "Renewable Energy", volume: 1000, status: "Available", date: "2025-05-10" },
    { id: "CRC008", type: "Forestry", volume: 750, status: "Available", date: "2025-05-01" },
  ];
  const navigate = useNavigate();


  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div>
          <h4>GreenCredit</h4>
          <ul>
            <li>Profile</li>
            <li onClick={() => setAiDropdownOpen(!aiDropdownOpen)}>
              AI INSIGHTS {aiDropdownOpen ? "▴" : "▾"}
            </li>
            {aiDropdownOpen && (
              <ul className="dropdown">
                <li>Emission Forecast</li>
                <li>Future Prediction</li>
                <li>Sustainability Score</li>
              </ul>
            )}
            <li>Notifications</li>
          </ul>
        </div>
        <div className="sidebar-footer">© 2025 GreenCredit</div>
      </div>

      {/* Main */}
      <div className="dashboard-main">
        {/* Top Navbar */}
        <div className="top-navbar">
          <button
            className={selectedTab === "carbon" ? "active" : ""}
            onClick={() => setSelectedTab("carbon")}
          >
            CARBON CREDIT
          </button>
            <button
                className={selectedTab === "auth" ? "active" : ""}
                onClick={() => {
                    setSelectedTab("auth"); navigate("/upload");}}
            >
            AUTHENTICATION
            </button>
            <button
            className={selectedTab === "admin" ? "active" : ""}
            onClick={() => setSelectedTab("admin")}
          >
            ADMIN PANEL
          </button>
        </div>

        <h2>Carbon Credits Dashboard</h2>

        {/* Stat Boxes */}
        <div className="stats-section">
          <div className="stat-box">
            <p>Total Credits:</p>
            <h4>5,500 tCO2e</h4>
          </div>
          <div className="stat-box">
            <p>Transferred:</p>
            <h4>1,500 tCO2e</h4>
          </div>
          <div className="stat-box">
            <p>Marketplace Value:</p>
            <h4>$135,000</h4>
          </div>
        </div>

        {/* Buttons */}
        <div className="action-buttons">
          <button className="green">ISSUE NEW CREDIT</button>
          <button className="black">TRANSFER CREDITS</button>
          <button className="red">RETIRE/BURN CREDITS</button>
        </div>

        {/* Toggle */}
        <div className="toggle-section">
          <button
            className={selectedToggle === "owned" ? "active" : ""}
            onClick={() => setSelectedToggle("owned")}
          >
            OWNED CREDITS
          </button>
          <button
            className={selectedToggle === "marketplace" ? "active" : ""}
            onClick={() => setSelectedToggle("marketplace")}
          >
            CREDIT MARKETPLACE
          </button>
        </div>

        {/* Table */}
        <div className="table-section">
          <h4>Your Carbon Credit Portfolio</h4>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Volume (tCO2e)</th>
                <th>Status</th>
                <th>Issue Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(selectedToggle === "owned" ? ownedCredits : marketCredits).map((item, idx) => (
                <tr key={idx}>
                  <td>{item.id}</td>
                  <td>{item.type}</td>
                  <td>{item.volume}</td>
                  <td>
                    <span
                      className={
                        item.status === "Active"
                          ? "status-active"
                          : item.status === "Retired"
                          ? "status-retired"
                          : "status-pending"
                      }
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>{item.date}</td>
                  <td><FaEye className="icon" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
