import React, { useContext } from "react";
import "./TopBar.css";

import {
  IconButton,
  Avatar,
  Badge,
  InputBase,
  Tooltip,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

import GeneralContext from "./GeneralContext";

const TopBar = () => {
  const { user, logout, theme, toggleTheme } = useContext(GeneralContext);

  const userName = user?.name || "Investor";
  const userInitial = userName.charAt(0).toUpperCase();

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="topbar">
      {/* Left Section */}
      <div className="topbar-left">
        <div>
          <h2>Dashboard</h2>
          <p>
            Welcome back, {userName} 👋 Manage your investments efficiently.
          </p>
        </div>
      </div>

      {/* Center Search */}
      <div className="search-box">
        <SearchRoundedIcon className="search-icon" />
        <InputBase
          placeholder="Search stocks, indices, orders..."
          className="search-input"
        />
      </div>

      {/* Right Section */}
      <div className="topbar-right">
        <div className="date-box">
          <CalendarMonthRoundedIcon />
          <span>{today}</span>
        </div>

        {/* Theme Toggle (Light / Dark) */}
        <Tooltip
          title={
            theme === "dark"
              ? "Switch to Light Mode"
              : "Switch to Dark Mode"
          }
        >
          <IconButton
            className="theme-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <LightModeRoundedIcon sx={{ color: "#facc15" }} />
            ) : (
              <DarkModeRoundedIcon sx={{ color: "#475569" }} />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title="3 Notifications">
          <IconButton className="theme-btn" aria-label="Notifications">
            <Badge badgeContent={3} color="error">
              <NotificationsNoneRoundedIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User Avatar with Profile details */}
        <Tooltip title={`${userName} (${user?.email || "demo@stockpilot.com"})`}>
          <Avatar
            sx={{
              bgcolor: "#2563EB",
              width: 44,
              height: 44,
              fontWeight: 700,
            }}
          >
            {userInitial}
          </Avatar>
        </Tooltip>

        {/* Explicit Logout Button in TopBar */}
        <button
          className="topbar-logout-btn"
          onClick={logout}
          aria-label="Logout"
          title="Sign out of StockPilot"
        >
          <LogoutRoundedIcon className="logout-icon" />
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
