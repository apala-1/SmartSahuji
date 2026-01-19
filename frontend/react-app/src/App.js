import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// 1. IMPORT NAVBAR (This fixes the 'Navbar' is not defined error)

// 2. IMPORT ALL YOUR PAGES
import LandingPage from "./pages/Landing/LandingPage";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import DataEntry from "./pages/AddData/DataEntry";
import Analytics from "./pages/Analytics/Analytics";

function App() {
  return (
    <Router>
      {/* Navbar sits outside Routes so it shows on every page */}
      <Navbar /> 
      
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard/Feature Routes */}
        <Route path="/data-entry" element={<DataEntry />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Router>
  );
}

export default App;