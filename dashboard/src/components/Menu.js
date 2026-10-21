import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";

import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";

import GeneralContext from "./GeneralContext";

import "./Menu.css";

const Menu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, theme, toggleTheme } = useContext(GeneralContext);

  const [menus] = useState([
    {
      name: "Dashboard",
      path: "/",
      icon: <DashboardRoundedIcon />,
    },
    {
      name: "Orders",
      path: "/orders",
      icon: <ReceiptLongRoundedIcon />,
    },
    {
      name: "Holdings",
      path: "/holdings",
      icon: <AccountBalanceWalletRoundedIcon />,
    },
    {
      name: "Positions",
      path: "/positions",
      icon: <ShowChartRoundedIcon />,
    },
    {
      name: "Funds",
      path: "/funds",
      icon: <AccountBalanceRoundedIcon />,
    },
    {
      name: "Apps",
      path: "/apps",
      icon: <GridViewRoundedIcon />,
    },
  ]);

  const userName = user?.name || "Investor";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="sidebar">
      {/* Logo */}
      <div
        className="logo-section"
        style={{ cursor: "pointer" }}
        onClick={() => {
          navigate("/");
        }}
      >
        <div className="logo-circle">
          <TrendingUpRoundedIcon fontSize="large" />
        </div>

        <div className="logo-text">
          <h2>StockPilot</h2>
          <span>Portfolio Manager</span>
        </div>
      </div>

      <Divider className="divider" />

      {/* Navigation Links */}
      <div className="sidebar-menu">
        {menus.map((menu) => (
          <Link
            key={menu.name}
            to={menu.path}
            className={`menu-link ${
              location.pathname === menu.path ? "active-menu" : ""
            }`}
          >
            <div className="menu-icon">{menu.icon}</div>
            <span>{menu.name}</span>
          </Link>
        ))}

        {/* Theme Toggle Button in Sidebar */}
        <button
          type="button"
          className="menu-link theme-menu-link"
          onClick={toggleTheme}
          aria-label="Toggle light and dark mode"
        >
          <div className="menu-icon">
            {theme === "dark" ? (
              <LightModeRoundedIcon sx={{ color: "#facc15" }} />
            ) : (
              <DarkModeRoundedIcon />
            )}
          </div>
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>

        {/* Dedicated Logout Option in Sidebar Navigation */}
        <button
          type="button"
          className="menu-link logout-menu-link"
          onClick={logout}
          aria-label="Logout from StockPilot"
        >
          <div className="menu-icon">
            <LogoutRoundedIcon />
          </div>
          <span>Logout</span>
        </button>
      </div>

      {/* Bottom Insights Card */}
      <div className="upgrade-card">
        <h4>Portfolio Analytics</h4>
        <p>
          Analyze your asset distribution, track market gains, and manage your orders in real time.
        </p>
        <button onClick={() => navigate("/holdings")}>
          View Holdings
        </button>
      </div>

      {/* Profile Section with Logout */}
      <div className="profile-section">
        <Avatar
          sx={{
            width: 44,
            height: 44,
            bgcolor: "#2563EB",
            fontWeight: 700,
          }}
        >
          {userInitial}
        </Avatar>

        <div className="profile-info">
          <h4>{userName}</h4>
          <span>{user?.email || "Investor"}</span>
        </div>

        <Tooltip title="Logout" placement="top">
          <button
            type="button"
            className="sidebar-logout-icon-btn"
            onClick={logout}
            aria-label="Logout"
          >
            <LogoutRoundedIcon />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default Menu;
