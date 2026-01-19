import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>SmartSahujiLogo</div>

      <div>
        <Link to="/" style={styles.link}>
          Home
        </Link>
        <Link to="/login" style={styles.link}>
          Login
        </Link>
        <Link to="/signup" style={styles.link}>
          Signup
        </Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 30px",
    backgroundColor: "#0f172a",
    color: "#fff",
  },
  logo: {
    fontWeight: "bold",
    fontSize: "20px",
  },
  link: {
    marginLeft: "15px",
    color: "#fff",
    textDecoration: "none",
  },
};

export default Navbar;
