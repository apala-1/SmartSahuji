import React from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div style={styles.container}>
      <h1>SmartSahuji</h1>
      <p>AI-powered business analytics for smarter decisions.</p>

      <div>
        <Link to="/login">
          <button style={styles.button}>Login</button>
        </Link>

        <Link to="/signup">
          <button style={styles.buttonOutline}>Sign Up</button>
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "100px",
  },
  button: {
    padding: "10px 20px",
    margin: "10px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  buttonOutline: {
    padding: "10px 20px",
    margin: "10px",
    backgroundColor: "#fff",
    color: "#2563eb",
    border: "1px solid #2563eb",
    cursor: "pointer",
  },
};

export default LandingPage;
