import React from "react";
import "../../pages/Dashboard/Dashboard.css";
import "../../components/Navbar/UserNavbar";
const UserDashboard = () => {
  return (
    <div className="page-wrapper">
      <main className="main-content">
        <div className="full-page-dashboard">
          <div className="fluid-container">
            {/* Header Section */}
            <div className="welcome-section">
              <h1>Namaste, SahuJi! 🙏</h1>
              <p>Real-time overview of your shop's performance.</p>
            </div>

            {/* Full-Width Stats Row */}
            <div className="stats-grid-row">
              <div className="stat-card-modern">
                <span className="stat-label">Today's Sales</span>
                <h2 className="stat-value">Rs. 12,450</h2>
                <span className="stat-trend up">+14% vs yesterday</span>
              </div>
              <div className="stat-card-modern">
                <span className="stat-label">Total Transactions</span>
                <h2 className="stat-value">48</h2>
                <span className="stat-trend neutral">Normal volume</span>
              </div>
              <div className="stat-card-modern">
                <span className="stat-label">Active Credit (Udhari)</span>
                <h2 className="stat-value u-danger">Rs. 5,200</h2>
                <span className="stat-trend">8 customers pending</span>
              </div>
              <div className="stat-card-modern">
                <span className="stat-label">Top Category</span>
                <h2 className="stat-value">Electronics</h2>
                <span className="stat-trend up">Trending Up</span>
              </div>
            </div>

            {/* Main Content: Expanded Grid */}
            <div className="dashboard-main-grid expanded">
              <div className="content-box recent-sales">
                <div className="box-header">
                  <h3>Recent Transactions</h3>
                  <button className="text-btn">View All History</button>
                </div>
                <table className="mini-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Samsung A54</td>
                      <td>Electronics</td>
                      <td>Rs. 42,000</td>
                      <td>
                        <span className="tag paid">Paid</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Dairy Milk (Bulk)</td>
                      <td>Food</td>
                      <td>Rs. 1,200</td>
                      <td>
                        <span className="tag credit">Credit</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Winter Jacket</td>
                      <td>Apparel</td>
                      <td>Rs. 4,500</td>
                      <td>
                        <span className="tag paid">Paid</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Logitech Mouse</td>
                      <td>Electronics</td>
                      <td>Rs. 2,500</td>
                      <td>
                        <span className="tag paid">Paid</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="side-panel">
                <div className="content-box action-box">
                  <h3>Quick Actions</h3>
                  <div className="button-list">
                    <button className="action-link-btn">➕ Add New Sale</button>
                    <button className="action-link-btn">
                      📉 View Analytics
                    </button>
                    <button className="action-link-btn">
                      📦 Update Inventory
                    </button>
                    <button className="action-link-btn">
                      🧾 Generate Report
                    </button>
                  </div>
                </div>

                <div className="content-box tip-box">
                  <div className="tip-icon">💡</div>
                  <h4>SahuJi Tip</h4>
                  <p>
                    Your "Electronics" sales are 20% higher on weekends. Stock
                    up by Friday!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
