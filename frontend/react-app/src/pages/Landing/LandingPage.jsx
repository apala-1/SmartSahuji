import React from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div style={styles.page}>
      {/* HERO SECTION */}
      <header style={styles.hero}>
        <div style={styles.logo}>SmartSahuji</div>
        <div style={styles.nav}>
          <Link style={styles.navLink} to="/login">
            Login
          </Link>
          <Link style={styles.navLink} to="/signup">
            Sign Up
          </Link>
        </div>

        <div style={styles.heroContent}>
          <h1 style={styles.title}>AI-Powered Business Analytics</h1>
          <p style={styles.subtitle}>
            Get real-time insights, smart predictions, and analytics for smarter
            business decisions.
          </p>

          <div style={styles.heroButtons}>
            <Link to="/signup">
              <button style={styles.primaryBtn}>Get Started</button>
            </Link>
            <Link to="/login">
              <button style={styles.secondaryBtn}>Login</button>
            </Link>
          </div>
        </div>
      </header>

      {/* FEATURES SECTION */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Features</h2>
        <div style={styles.features}>
          <div style={styles.card}>
            <h3>📈 Real-time Analytics</h3>
            <p>Track business performance and get instant insights.</p>
          </div>
          <div style={styles.card}>
            <h3>🤖 AI Predictions</h3>
            <p>Forecast sales and trends using AI models.</p>
          </div>
          <div style={styles.card}>
            <h3>💬 Smart Suggestions</h3>
            <p>Receive actionable business recommendations.</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section style={styles.sectionAlt}>
        <h2 style={styles.sectionTitle}>What People Say</h2>
        <div style={styles.features}>
          <div style={styles.card}>
            <p>
              “SmartSahuji helped me grow my sales by 40% in just 3 months!”
            </p>
            <h4>— Sita, Store Owner</h4>
          </div>
          <div style={styles.card}>
            <p>“The AI suggestions are accurate and easy to implement.”</p>
            <h4>— Raj, Business Analyst</h4>
          </div>
          <div style={styles.card}>
            <p>“Best tool for small businesses. Highly recommended!”</p>
            <h4>— Mina, Entrepreneur</h4>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p>© 2026 SmartSahuji. All rights reserved.</p>
        <p>Contact: support@smartsahuji.com</p>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "Arial, sans-serif",
    color: "#111827",
  },
  hero: {
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#fff",
    padding: "50px 20px",
    textAlign: "center",
  },
  logo: {
    fontSize: "24px",
    fontWeight: "700",
    letterSpacing: "1px",
    marginBottom: "20px",
  },
  nav: {
    position: "absolute",
    top: "20px",
    right: "30px",
  },
  navLink: {
    color: "#fff",
    margin: "0 10px",
    textDecoration: "none",
    fontWeight: "600",
  },
  heroContent: {
    maxWidth: "700px",
    margin: "0 auto",
  },
  title: {
    fontSize: "42px",
    marginBottom: "20px",
  },
  subtitle: {
    fontSize: "18px",
    marginBottom: "30px",
  },
  heroButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
  },
  primaryBtn: {
    padding: "12px 25px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#fff",
    color: "#2563eb",
    fontWeight: "700",
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "12px 25px",
    borderRadius: "8px",
    border: "1px solid #fff",
    backgroundColor: "transparent",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },
  section: {
    padding: "50px 20px",
    textAlign: "center",
  },
  sectionAlt: {
    padding: "50px 20px",
    textAlign: "center",
    backgroundColor: "#f3f4f6",
  },
  sectionTitle: {
    fontSize: "30px",
    marginBottom: "30px",
  },
  features: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  card: {
    backgroundColor: "#fff",
    padding: "20px",
    width: "250px",
    borderRadius: "12px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  },
  footer: {
    padding: "30px 20px",
    textAlign: "center",
    backgroundColor: "#111827",
    color: "#fff",
  },
};

export default LandingPage;
