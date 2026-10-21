import React, { useContext, useMemo } from "react";
import "./Summary.css";
import { useNavigate } from "react-router-dom";

import GeneralContext from "./GeneralContext";

import { VerticalGraph } from "./VerticalGraph";
import { DoughnutChart } from "./DoughnoutChart";

import {
  TrendingUp,
  AccountBalanceWallet,
  Savings,
  ShowChart,
} from "@mui/icons-material";

const Summary = () => {
  const generalContext = useContext(GeneralContext);
  const { holdings = [], user } = generalContext;

  const navigate = useNavigate();

  const totalInvestment = useMemo(() => {
    return holdings.reduce((sum, stock) => sum + stock.avg * stock.qty, 0);
  }, [holdings]);

  const currentValue = useMemo(() => {
    return holdings.reduce((sum, stock) => sum + stock.price * stock.qty, 0);
  }, [holdings]);

  const totalProfit = currentValue - totalInvestment;
  const profitPercentage =
    totalInvestment === 0 ? 0 : (totalProfit / totalInvestment) * 100;
  const availableCash = user?.availableCash ?? 3740;

  const handleBuy = () => {
    generalContext.openBuyWindow("TCS");
  };

  const handleSell = () => {
    generalContext.openSellWindow("TCS");
  };

  return (
    <div className="summary-page">

      {/* Header */}

      <div className="summary-header">

        <div>

          <h1>Portfolio Dashboard</h1>

          <p>
            Welcome back{user?.name ? `, ${user.name}` : ""}! Here&apos;s an overview of your investments.
          </p>

        </div>

      </div>

      {/* Cards */}

      <div className="summary-cards">

        <div className="summary-card">

          <div className="card-icon blue">
            <AccountBalanceWallet />
          </div>

          <div>

            <h4>Portfolio Value</h4>

            <h2>₹{Math.round(currentValue).toLocaleString("en-IN")}</h2>

            <span className={profitPercentage >= 0 ? "positive" : "negative"}>
              {profitPercentage >= 0 ? "+" : ""}
              {profitPercentage.toFixed(2)}%
            </span>

          </div>

        </div>

        <div className="summary-card">

          <div className="card-icon green">
            <TrendingUp />
          </div>

          <div>

            <h4>Today&apos;s Gain</h4>

            <h2>₹{Math.round(totalProfit).toLocaleString("en-IN")}</h2>

            <span className={totalProfit >= 0 ? "positive" : "negative"}>
              {totalProfit >= 0 ? "+" : ""}₹{Math.round(totalProfit * 0.27).toLocaleString("en-IN")} Today
            </span>

          </div>

        </div>

        <div className="summary-card">

          <div className="card-icon orange">
            <ShowChart />
          </div>

          <div>

            <h4>Invested</h4>

            <h2>₹{Math.round(totalInvestment).toLocaleString("en-IN")}</h2>

            <span>{holdings.length} Holdings</span>

          </div>

        </div>

        <div className="summary-card">

          <div className="card-icon purple">
            <Savings />
          </div>

          <div>

            <h4>Available Cash</h4>

            <h2>₹{Math.round(availableCash).toLocaleString("en-IN")}</h2>

            <span>Ready to Invest</span>

          </div>

        </div>

      </div>

      {/* Charts */}

      <div className="chart-row">

        <div className="chart-card">

          <h3>Portfolio Performance</h3>

          <VerticalGraph />

        </div>

        <div className="chart-card">

          <h3>Asset Allocation</h3>

          <DoughnutChart />

        </div>

      </div>

      {/* Bottom */}

      <div className="bottom-row">

        <div className="market-card">

          <h3>Market Overview</h3>

          <div className="market-item">

            <span>NIFTY 50</span>

            <strong className="positive">
              +0.82%
            </strong>

          </div>

          <div className="market-item">

            <span>SENSEX</span>

            <strong className="positive">
              +0.74%
            </strong>

          </div>

          <div className="market-item">

            <span>BANK NIFTY</span>

            <strong className="negative">
              -0.24%
            </strong>

          </div>

        </div>

        <div className="market-card">

          <h3>Quick Actions</h3>

          <button onClick={handleBuy}>
            Buy Stock
          </button>

          <button onClick={handleSell}>
            Sell Stock
          </button>

          <button onClick={() => navigate("/holdings")}>
            View Holdings
          </button>

          <button onClick={() => window.print()}>
            Export Report
          </button>

        </div>

      </div>

    </div>
  );
};

export default Summary;
