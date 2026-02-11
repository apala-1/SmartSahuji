import React, { useState, useEffect } from "react";
import UserNavbar from "../../components/Navbar/UserNavbar";
import "../../styles/DataEntry.css";

const DataEntry = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product_name: "",
    barcode: "",
    category: "",
    item_type: "Sale", // Sale or Purchase
    sale_type: "",
    price: "",
    cost: "",
    quantity: "",
    date: "",
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetch("/api/products", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setProducts([data.product, ...products]);
        setForm({
          product_name: "",
          barcode: "",
          category: "",
          item_type: "Sale",
          sale_type: "",
          price: "",
          cost: "",
          quantity: "",
          date: "",
        });
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error adding product: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(products.filter((p) => p._id !== id));
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error deleting product: " + err.message);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/products/upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        alert(`${data.count} products uploaded`);
        fetch("/api/products", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
          .then((res) => res.json())
          .then((data) => setProducts(data));
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Upload error: " + err.message);
    }
  };

  return (
    <div>
      <div className="data-entry-container">
        <h2>Add Product</h2>
        <form onSubmit={handleSubmit} className="data-entry-form">
          {/* Sale/Purchase selection at top */}
          <select
            name="item_type"
            value={form.item_type}
            onChange={handleChange}
          >
            <option value="Sale">Sale</option>
            <option value="Purchase">Purchase</option>
          </select>

          <input
            name="product_name"
            value={form.product_name}
            onChange={handleChange}
            placeholder="Product Name"
            required
          />

          <input
            name="barcode"
            value={form.barcode}
            onChange={handleChange}
            placeholder="Barcode"
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Food">Food</option>
            <option value="Other">Other</option>
          </select>

          {form.item_type === "Sale" && (
            <>
              <select
                name="sale_type"
                value={form.sale_type}
                onChange={handleChange}
                required
              >
                <option value="">Select Sale Type</option>
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Online">Online</option>
              </select>

              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="Price"
                required
              />
            </>
          )}

          {form.item_type === "Purchase" && (
            <input
              name="cost"
              type="number"
              value={form.cost}
              onChange={handleChange}
              placeholder="Cost"
              required
            />
          )}

          <input
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            required
          />
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
          />
          <button type="submit">Add Product</button>
        </form>

        <h2>Bulk Upload</h2>
        <form onSubmit={handleUpload}>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button type="submit">Upload</button>
        </form>

        <h2>Products</h2>
        <table className="products-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Barcode</th>
              <th>Category</th>
              <th>Item Type</th>
              <th>Sale Type</th>
              <th>Price</th>
              <th>Cost</th>
              <th>Quantity</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(products) &&
              products.map((p) => (
                <tr key={p._id}>
                  <td>{p.product_name}</td>
                  <td>{p.barcode || "-"}</td>
                  <td>{p.category}</td>
                  <td>{p.item_type}</td>
                  <td>{p.sale_type || "-"}</td>
                  <td>{p.price}</td>
                  <td>{p.cost}</td>
                  <td>{p.quantity}</td>
                  <td>{new Date(p.date).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleDelete(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataEntry;
