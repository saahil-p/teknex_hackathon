import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      
      <div className="menu-wrapper">
        
        {/* TOP SECTION */}
        <div>
          <div className="sidebar-logo">
            <img src="/geargenie-logo.jpeg" alt="GearGenie" />
            <h2>GearGenie</h2>
          </div>

          {/* MENU ITEMS */}
          <div className="menu">
            <Link
              to="/dashboard"
              className={location.pathname === "/dashboard" ? "menu-item active" : "menu-item"}
            >
              Dashboard
            </Link>

            <Link
              to="/orders"
              className={location.pathname === "/orders" ? "menu-item active" : "menu-item"}
            >
              Service Bookings
            </Link>
          </div>
        </div>

        {/* BOTTOM LOGOUT BUTTON */}
        <button 
          className="logout-btn neon-btn"
          onClick={() => {
            localStorage.removeItem("dealer");
            window.location.href = "/";
          }}
        >
          Logout
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;
