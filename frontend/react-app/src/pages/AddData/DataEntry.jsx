import React, { useState, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/DataEntry.css";

const DataEntry = () => {
  const [form, setForm] = useState({
    product_name: "",
    barcode: "",
    category: "",
    sale_type: "Retail",
    price: 0,
    quantity: 1,
    date: new Date().toISOString().split("T")[0],
    adHoc: false,
  });

  const [currentStock, setCurrentStock] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [saleQueue, setSaleQueue] = useState([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);
  const token = localStorage.getItem("token");

  // -----------------------------
  // SEARCH INVENTORY
  // -----------------------------
  const searchInventory = async (query) => {
    if (!query || query.length < 2 || form.adHoc) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await axios.get(`/api/inventory/search?query=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const items = res.data.items || res.data.inventory || [];
      setSuggestions(items);
      setShowDropdown(items.length > 0);
      setHighlightIndex(-1);
    } catch (err) {
      console.error("Inventory search error:", err);
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  // -----------------------------
  // HANDLE INPUT CHANGE
  // -----------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "adHoc") {
      setForm({
        product_name: "",
        barcode: "",
        category: "",
        sale_type: "Retail",
        price: 0,
        quantity: 1,
        date: new Date().toISOString().split("T")[0],
        adHoc: checked,
      });
      setSuggestions([]);
      setShowDropdown(false);
      setCurrentStock(null);
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));

    if ((name === "product_name" || name === "barcode") && !form.adHoc) {
      searchInventory(value);
    }
  };

  // -----------------------------
  // SELECT PRODUCT FROM DROPDOWN
  // -----------------------------
  const selectProduct = (item) => {
    setForm({
      product_name: item.name || "",
      barcode: item.barcode || "",
      category: item.itemType || "",
      sale_type: "Retail",
      price: item.sellingPrice ?? item.price ?? 0, // Price always set
      quantity: 1,
      date: new Date().toISOString().split("T")[0],
      adHoc: false,
    });
    setCurrentStock(item.currentStock ?? 0);
    setSuggestions([]);
    setShowDropdown(false);
    setHighlightIndex(-1);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // -----------------------------
  // KEYBOARD NAVIGATION
  // -----------------------------
  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0,
      );
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1,
      );
    }
    if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      selectProduct(suggestions[highlightIndex]);
    }
    if (e.key === "Escape") {
      setShowDropdown(false);
      setHighlightIndex(-1);
    }
  };

  // -----------------------------
  // ADD TO SALE QUEUE
  // -----------------------------
  const addToQueue = () => {
    if (!form.product_name || !form.quantity) {
      return toast.error("Enter product name and quantity");
    }
    if (!form.adHoc && Number(form.quantity) > currentStock) {
      return toast.error(`Only ${currentStock} items available`);
    }
    const exists = saleQueue.find((i) => i.product_name === form.product_name);
    if (exists)
      return toast.error("Product already in queue. Adjust quantity there.");

    setSaleQueue([...saleQueue, { ...form }]);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      product_name: "",
      barcode: "",
      category: "",
      sale_type: "Retail",
      price: 0,
      quantity: 1,
      date: new Date().toISOString().split("T")[0],
      adHoc: false,
    });
    setCurrentStock(null);
    inputRef.current?.focus();
  };

  // -----------------------------
  // REMOVE / UPDATE QUANTITY
  // -----------------------------
  const removeFromQueue = (index) =>
    setSaleQueue((prev) => prev.filter((_, i) => i !== index));

  const changeQuantity = (index, delta) => {
    setSaleQueue((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const newQty = Number(item.quantity) + delta;
          if (newQty > 0 && (item.adHoc || newQty <= currentStock))
            return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  // -----------------------------
  // SUBMIT ALL SALES
  // -----------------------------
  const submitQueue = async () => {
    if (saleQueue.length === 0) return toast.error("No products to submit");
    setLoading(true);
    try {
      for (const item of saleQueue) {
        await axios.post(
          "/api/products",
          {
            product_name: item.product_name,
            barcode: item.barcode,
            category: item.category || "Other",
            item_type: "Sale",
            sale_type: item.sale_type,
            price: Number(item.price) || 0,
            quantity: Number(item.quantity),
            date: item.date,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
      toast.success("Sales submitted successfully");
      setSaleQueue([]);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-entry-container">
      <ToastContainer autoClose={3000} />
      <h2>Counter Sales Entry</h2>

      <label>
        <input
          type="checkbox"
          name="adHoc"
          checked={form.adHoc}
          onChange={handleChange}
        />{" "}
        Add item manually
      </label>

      <input
        ref={inputRef}
        name="product_name"
        placeholder="Product Name"
        value={form.product_name}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        disabled={form.adHoc === false && false}
      />

      {!form.adHoc && showDropdown && suggestions.length > 0 && (
        <ul className="dropdown">
          {suggestions.map((item, index) => (
            <li
              key={item._id}
              className={index === highlightIndex ? "active" : ""}
              onClick={() => selectProduct(item)}
            >
              <strong>{item.name}</strong>
              <div className="dropdown-meta">
                <span>Barcode: {item.barcode}</span>
                <span>Stock: {item.currentStock}</span>
                <span>Rs. {item.sellingPrice}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input
        name="barcode"
        placeholder="Barcode"
        value={form.barcode}
        onChange={handleChange}
      />
      <input
        name="category"
        placeholder="Category"
        value={form.category}
        onChange={handleChange}
      />
      <input
        name="price"
        placeholder="Price"
        type="number"
        value={form.price}
        onChange={handleChange}
        disabled={!form.adHoc} // only editable in adHoc mode
      />

      <select name="sale_type" value={form.sale_type} onChange={handleChange}>
        <option value="Retail">Retail</option>
        <option value="Wholesale">Wholesale</option>
      </select>

      <div className="quantity-group">
        <button
          type="button"
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              quantity: Math.max(1, prev.quantity - 1),
            }))
          }
        >
          -
        </button>
        <input
          type="number"
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          min={1}
        />
        <button
          type="button"
          onClick={() =>
            setForm((prev) => ({ ...prev, quantity: prev.quantity + 1 }))
          }
        >
          +
        </button>
      </div>

      {currentStock !== null && !form.adHoc && <p>Stock: {currentStock}</p>}

      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
      />

      <button type="button" onClick={addToQueue}>
        Add to Queue
      </button>

      {saleQueue.length > 0 && (
        <div className="sale-queue">
          <h3>Sale Queue</h3>
          {saleQueue.map((item, index) => (
            <div key={index} className="queue-item">
              <span>
                {item.product_name} ({item.sale_type})
              </span>
              <span>Rs. {item.price}</span>
              <span>
                <button onClick={() => changeQuantity(index, -1)}>-</button>
                {item.quantity}
                <button onClick={() => changeQuantity(index, 1)}>+</button>
              </span>
              <button onClick={() => removeFromQueue(index)}>Remove</button>
            </div>
          ))}
          <button onClick={submitQueue} disabled={loading}>
            {loading ? "Submitting..." : "Submit All Sales"}
          </button>
        </div>
      )}
    </div>
  );
};

export default DataEntry;
