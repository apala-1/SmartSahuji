import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="logo-section">
          <span className="logo-icon">📊</span>
          <div className="logo-text">
            <strong>Smart SahuJi</strong>
            <small>BUSINESS PLATFORM</small>
          </div>
        </div>
        <div className="nav-links">
          <a href="#features" className="nav-link">
            Features
          </a>
          <a href="#testimonials" className="nav-link">
            Testimonials
          </a>
          <Link to="/login" className="nav-link">
            Login
          </Link>
          <Link to="/signup" className="nav-btn">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">AI-Powered Business Analytics</h1>
          <p className="hero-subtitle">
            Transform your business with real-time insights, smart predictions,
            and actionable analytics. Make data-driven decisions with confidence
            and scale your business like never before.
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="primary-btn">
              Start Free Trial
            </Link>
            <Link to="/login" className="secondary-btn">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section">
        <h2 className="section-title">Powerful Features</h2>
        <p className="section-subtitle">
          Everything you need to run a smarter, more profitable business
        </p>
        <div className="features">
          <div className="card">
            <div className="card-icon">📈</div>
            <h3>Real-time Analytics</h3>
            <p>
              Track your business performance with live data and interactive
              dashboards. Monitor sales, inventory, and customer trends
              instantly.
            </p>
          </div>
          <div className="card">
            <div className="card-icon">🤖</div>
            <h3>AI Predictions</h3>
            <p>
              Leverage advanced machine learning to forecast trends, optimize
              inventory, and predict customer behavior with 95% accuracy
            </p>
          </div>
          <div className="card">
            <div className="card-icon">💡</div>
            <h3>Smart Insights</h3>
            <p>
              Get intelligent recommendations to improve sales, reduce costs,
              and enhance customer satisfaction with actionable insights.
            </p>
          </div>
          <div className="card">
            <div className="card-icon">📊</div>
            <h3>Custom Reports</h3>
            <p>
              Generate detailed reports tailored to your business needs. Export
              and share insights with your team effortlessly.
            </p>
          </div>
          <div className="card">
            <div className="card-icon">🔔</div>
            <h3>Smart Alerts</h3>
            <p>
              Receive real-time notifications about low stock, unusual sales
              patterns, and important business events.
            </p>
          </div>
          <div className="card">
            <div className="card-icon">🔒</div>
            <h3>Secure & Reliable</h3>
            <p>
              Your data is protected with enterprise-grade security. We ensure
              99.9% uptime for uninterrupted business operations.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="section-alt">
        <h2 className="section-title">What Our Customers Say</h2>
        <p className="section-subtitle">
          Join thousands of businesses already growing with Smart SahuJi
        </p>
        <div className="features">
          <div className="testimonial-card">
            <p className="testimonial-text">
              "Smart SahuJi helped me increase my sales by 40% in just 3 months!
              The AI predictions are incredibly accurate and have saved me
              thousands in inventory costs."
            </p>
            <div className="testimonial-author">
              — Sita Sharma, Grocery Store Owner
            </div>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-text">
              "The inventory predictions saved me from stockouts and
              overstocking. I can finally focus on growing my business instead
              of worrying about inventory management."
            </p>
            <div className="testimonial-author">
              — Raj Patel, Electronics Retailer
            </div>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-text">
              "Easy to use and incredibly powerful. A must-have for small
              businesses! The customer support team is also very responsive and
              helpful."
            </p>
            <div className="testimonial-author">
              — Mina Singh, Fashion Boutique
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to Transform Your Business?</h2>
        <p className="cta-subtitle">
          Join thousands of businesses using Smart SahuJi to make smarter
          decisions
        </p>
        <Link to="/signup" className="primary-btn">
          Start Your Free Trial
        </Link>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-column">
              <h3 className="footer-heading">📊 Smart SahuJi</h3>
              <p className="footer-description">
                AI-powered business analytics platform helping thousands of
                businesses make smarter decisions with real-time insights and
                predictions.
              </p>
              <div className="footer-social">
                <span className="social-icon">📘</span>
                <span className="social-icon">🐦</span>
                <span className="social-icon">📸</span>
                <span className="social-icon">💼</span>
              </div>
            </div>

            <div className="footer-column">
              <h4 className="footer-column-title">Product</h4>
              <a href="#features" className="footer-link">
                Features
              </a>
              <a href="#" className="footer-link">
                Pricing
              </a>
              <a href="#testimonials" className="footer-link">
                Testimonials
              </a>
              <a href="#" className="footer-link">
                FAQ
              </a>
              <a href="#" className="footer-link">
                Roadmap
              </a>
            </div>

            <div className="footer-column">
              <h4 className="footer-column-title">Company</h4>
              <a href="#" className="footer-link">
                About Us
              </a>
              <a href="#" className="footer-link">
                Careers
              </a>
              <a href="#" className="footer-link">
                Blog
              </a>
              <a href="#" className="footer-link">
                Press
              </a>
              <a href="#" className="footer-link">
                Partners
              </a>
            </div>

            <div className="footer-column">
              <h4 className="footer-column-title">Support</h4>
              <a href="#" className="footer-link">
                Help Center
              </a>
              <a href="#" className="footer-link">
                Documentation
              </a>
              <a href="#" className="footer-link">
                API Reference
              </a>
              <a href="#" className="footer-link">
                Community
              </a>
              <a href="#" className="footer-link">
                Contact Us
              </a>
            </div>

            <div className="footer-column">
              <h4 className="footer-column-title">Contact</h4>
              <p className="footer-contact">📧 support@smartsahuji.com</p>
              <p className="footer-contact">📞 +977 1-4567890</p>
              <p className="footer-contact">📍 Kathmandu, Nepal</p>
              <p className="footer-contact">⏰ Mon-Fri: 9AM-6PM</p>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-text">
              © 2026 Smart SahuJi. All rights reserved.
            </p>
            <div className="footer-legal">
              <a href="#" className="footer-legal-link">
                Privacy Policy
              </a>
              <a href="#" className="footer-legal-link">
                Terms of Service
              </a>
              <a href="#" className="footer-legal-link">
                Cookie Policy
              </a>
              <a href="#" className="footer-legal-link">
                Security
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
