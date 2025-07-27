import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotAuthorized = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate("/login");
    }, 3000); // auto-redirect after 3 seconds

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
      <h1>403 - Not Authorized</h1>
      <p>You don’t have permission to view this page.</p>
      <p>Redirecting to login...</p>
    </div>
  );
};

export default NotAuthorized;
