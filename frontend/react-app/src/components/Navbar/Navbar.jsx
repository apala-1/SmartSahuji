import React from "react";
import { Link } from "react-router-dom";
// Import your logo from your images folder
import logoImg from "../../assets/images/logo.jpeg";

function Navbar() {
  return (
    <nav style={styles.nav}>
      <div style={styles.logoContainer}>
        <img src={logoImg} alt="SahuJi Logo" style={styles.logoImg} />
        <span style={styles.logoText}>
          smart <span style={{ color: "#ffcc00" }}>SahuJi</span>
        </span>
      </div>

      <div style={styles.linksContainer}>
        <Link to="/" style={styles.link}>
          Home
        </Link>
        <Link to="/data-entry" style={styles.link}>
          Data Entry
        </Link>
        <Link to="/analytics" style={styles.link}>
          Analytics
        </Link>
        <Link to="/login" style={styles.loginBtn}>
          Login
        </Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 40px",
    backgroundColor: "#000000", // Black looks premium with the orange theme
    color: "#fff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoImg: {
    height: "40px",
    width: "40px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    objectFit: "contain",
  },
  logoText: {
    fontWeight: "900",
    fontSize: "22px",
    fontStyle: "italic",
    letterSpacing: "1px",
  },
  linksContainer: {
    display: "flex",
    alignItems: "center",
  },
  link: {
    marginLeft: "25px",
    color: "#fff",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  loginBtn: {
    marginLeft: "25px",
    color: "#000",
    backgroundColor: "#ffcc00", // Matching your gold/yellow accents
    padding: "6px 18px",
    borderRadius: "20px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "bold",
  },
};

export default Navbar;
