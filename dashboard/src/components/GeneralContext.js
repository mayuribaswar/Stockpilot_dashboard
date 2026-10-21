import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

import TradeDialog from "./TradeDialog";

const GeneralContext = React.createContext({
  openBuyWindow: (uid) => {},
  closeBuyWindow: () => {},
  openSellWindow: (uid) => {},
  closeSellWindow: () => {},
  user: null,
  holdings: [],
  orders: [],
  positions: [],
  refreshData: () => {},
  logout: () => {},
  theme: "light",
  toggleTheme: () => {},
});

export const GeneralContextProvider = ({ children }) => {
  const [isBuyWindowOpen, setIsBuyWindowOpen] = useState(false);
  const [isSellWindowOpen, setIsSellWindowOpen] = useState(false);
  const [selectedStockUID, setSelectedStockUID] = useState("");

  // Theme Management (Light / Dark)
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("stockpilot_theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        return savedTheme;
      }
      return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("stockpilot_theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
      if (theme === "dark") {
        document.body.classList.add("dark-theme");
      } else {
        document.body.classList.remove("dark-theme");
      }
    } catch (e) {
      console.warn("Theme sync error:", e);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [holdings, setHoldings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [positions, setPositions] = useState([]);

  const refreshData = useCallback(async () => {
    try {
      const [meRes, holdingsRes, ordersRes, positionsRes] = await Promise.all([
        axios.get("/me"),
        axios.get("/allHoldings"),
        axios.get("/allOrders"),
        axios.get("/allPositions"),
      ]);

      if (meRes.data && meRes.data.user) {
        setUser(meRes.data.user);
        localStorage.setItem("user", JSON.stringify(meRes.data.user));
      }
      if (Array.isArray(holdingsRes.data)) {
        setHoldings(holdingsRes.data);
      }
      if (Array.isArray(ordersRes.data)) {
        setOrders(ordersRes.data);
      }
      if (Array.isArray(positionsRes.data)) {
        setPositions(positionsRes.data);
      }
    } catch (err) {
      console.error("Failed to load user portfolio data:", err);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleLogout = useCallback(() => {
    try {
      axios.post("/logout").catch(() => {});
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setHoldings([]);
    setOrders([]);
    setPositions([]);
    // Notify application to return to Login/Signup screen
    window.dispatchEvent(new Event("stockpilot_auth_changed"));
    window.location.replace("/");
  }, []);

  // BUY
  const handleOpenBuyWindow = (uid = "") => {
    setSelectedStockUID(uid);
    setIsBuyWindowOpen(true);
  };

  const handleCloseBuyWindow = () => {
    setSelectedStockUID("");
    setIsBuyWindowOpen(false);
  };

  // SELL
  const handleOpenSellWindow = (uid = "") => {
    setSelectedStockUID(uid);
    setIsSellWindowOpen(true);
  };

  const handleCloseSellWindow = () => {
    setSelectedStockUID("");
    setIsSellWindowOpen(false);
  };

  return (
    <GeneralContext.Provider
      value={{
        openBuyWindow: handleOpenBuyWindow,
        closeBuyWindow: handleCloseBuyWindow,
        openSellWindow: handleOpenSellWindow,
        closeSellWindow: handleCloseSellWindow,
        user,
        holdings,
        orders,
        positions,
        refreshData,
        logout: handleLogout,
        theme,
        toggleTheme,
      }}
    >
      {children}

      <TradeDialog
        open={isBuyWindowOpen}
        onClose={handleCloseBuyWindow}
        mode="BUY"
        defaultStock={selectedStockUID}
        onOrderSuccess={refreshData}
      />

      <TradeDialog
        open={isSellWindowOpen}
        onClose={handleCloseSellWindow}
        mode="SELL"
        defaultStock={selectedStockUID}
        onOrderSuccess={refreshData}
      />
    </GeneralContext.Provider>
  );
};

export default GeneralContext;
