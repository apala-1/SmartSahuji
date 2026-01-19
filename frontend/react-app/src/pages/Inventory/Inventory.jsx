import React from "react";
import "../../pages/Inventory/Inventory.css";

const InventoryPage = () => {
  // Mock data for the inventory
  const inventoryItems = [
    {
      id: 1,
      name: "Samsung Galaxy A54",
      category: "Electronics",
      stock: 5,
      price: "Rs. 42,000",
      status: "Low Stock",
    },
    {
      id: 2,
      name: "Dairy Milk Silk",
      category: "Food",
      stock: 45,
      price: "Rs. 150",
      status: "In Stock",
    },
    {
      id: 3,
      name: "Logitech Mouse",
      category: "Electronics",
      stock: 2,
      price: "Rs. 1,200",
      status: "Out of Stock",
    },
    {
      id: 4,
      name: "Cotton T-Shirt (L)",
      category: "Apparel",
      stock: 12,
      price: "Rs. 800",
      status: "In Stock",
    },
  ];

  return (
    <div className="inventory-wrapper">
      <div className="fluid-container">
        <div className="inventory-header">
          <div>
            <h1>Inventory Management 📦</h1>
            <p>Track and manage your shop's stock levels.</p>
          </div>
          <button className="add-stock-btn">+ ADD NEW PRODUCT</button>
        </div>

        {/* Quick Filters */}
        <div className="inventory-filters">
          <input
            type="text"
            placeholder="Search by product name..."
            className="search-bar"
          />
          <select className="filter-dropdown">
            <option>All Categories</option>
            <option>Electronics</option>
            <option>Food</option>
            <option>Apparel</option>
          </select>
          <div className="stock-summary">
            <span>
              Total Items: <b>154</b>
            </span>
            <span>
              Low Stock: <b style={{ color: "#e53e3e" }}>12</b>
            </span>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="inventory-card">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Unit Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.stock} Units</td>
                  <td>{item.price}</td>
                  <td>
                    <span
                      className={`status-tag ${item.status.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button className="edit-icon">✏️</button>
                    <button className="delete-icon">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
