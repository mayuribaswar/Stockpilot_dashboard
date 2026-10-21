import React from "react";
import { Routes, Route } from "react-router-dom";

import Menu from "./Menu";
import TopBar from "./TopBar";
import Summary from "./Summary";
import Orders from "./Orders";
import Holdings from "./Holdings";
import Positions from "./Positions";
import Funds from "./Funds";
import Apps from "./Apps";

import { GeneralContextProvider } from "./GeneralContext";

import "./Dashboard.css";

function Dashboard() {
  return (
    <GeneralContextProvider>
      <div className="dashboard-layout">

        <Menu />

        <div className="dashboard-main">

          <TopBar />

          <div className="dashboard-body">

            <Routes>
              <Route path="/" element={<Summary />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/holdings" element={<Holdings />} />
              <Route path="/positions" element={<Positions />} />
              <Route path="/funds" element={<Funds />} />
              <Route path="/apps" element={<Apps />} />
            </Routes>

          </div>

        </div>

      </div>
    </GeneralContextProvider>
  );
}

export default Dashboard;
