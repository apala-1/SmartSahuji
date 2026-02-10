import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// NAVBAR IMPORTS
import Navbar from "./components/Navbar/Navbar";         // Public Navbar
import UserNavbar from "./components/Navbar/UserNavbar"; // Logged-in Navbar

// PAGE IMPORTS
import LandingPage from "./pages/Landing/LandingPage";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import DataEntry from "./pages/AddData/DataEntry";
import Analytics from "./pages/Analytics/Analytics";
import DataSheet from "./pages/AddData/DataSheet";
import UserDashboard from "./pages/Dashboard/Dashboard";
import InventoryPage from "./pages/Inventory/Inventory";
import SalesHistory from "./pages/ShowData/SalesHistory";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ForgotPassword/ResetPassword";
import Insights from "./components/Insights";
import ProfilePage from "./pages/Profile/ProfilePage";


function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES (No Navbar or Landing Navbar) */}
        <Route path="/" element={<><Navbar /><LandingPage /></>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* PRIVATE ROUTES (All use UserNavbar) */}
        <Route path="/dashboard" element={<><UserNavbar /><UserDashboard /></>} />
        <Route path="/data-entry" element={<><UserNavbar /><DataEntry /></>} />
        <Route path="/analytics" element={<><UserNavbar /><Analytics /></>} />
        <Route path="/datasheet" element={<><UserNavbar /><DataSheet /></>} />
        <Route path="/profile" element={<><ProfilePage></ProfilePage></>}/>
        
        {/* Added the missing Inventory route here */}
        <Route path="/inventory" element={<><UserNavbar /><InventoryPage /></>} />
        <Route path="/sales" element={<SalesHistory />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password/:token" element={<ResetPassword />} />

    <Route
  path="/insights"
  element={
    <>
      <UserNavbar />
      <Insights />
    </>
  }
/>

      </Routes>
    </Router>
  );
}

export default App;