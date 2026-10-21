import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Holdings.css";
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Button,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import CurrencyRupeeRoundedIcon from "@mui/icons-material/CurrencyRupeeRounded";
import PieChartRoundedIcon from "@mui/icons-material/PieChartRounded";

import { VerticalGraph } from "./VerticalGraph";
import GeneralContext from "./GeneralContext";

const Holdings = () => {
  const { holdings: contextHoldings } = useContext(GeneralContext);
  const [allHoldings, setAllHoldings] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (Array.isArray(contextHoldings) && contextHoldings.length > 0) {
      setAllHoldings(contextHoldings);
    }
  }, [contextHoldings]);

  useEffect(() => {
    axios
      .get("/allHoldings")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setAllHoldings(res.data);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const filteredHoldings = useMemo(() => {
    return allHoldings.filter((stock) =>
      stock.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [allHoldings, search]);

  const totalInvestment = useMemo(() => {
    return filteredHoldings.reduce(
      (sum, stock) => sum + stock.avg * stock.qty,
      0
    );
  }, [filteredHoldings]);

  const currentValue = useMemo(() => {
    return filteredHoldings.reduce(
      (sum, stock) => sum + stock.price * stock.qty,
      0
    );
  }, [filteredHoldings]);

  const totalProfit = currentValue - totalInvestment;

  const profitPercentage =
    totalInvestment === 0 ? 0 : (totalProfit / totalInvestment) * 100;

  const labels = filteredHoldings.map((stock) => stock.name);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Current Price",
        data: filteredHoldings.map((stock) => stock.price),
        backgroundColor: "#2563EB",
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="holdings-page">

      {/* Header */}

      <div className="holdings-header">

        <div>

          <Typography variant="h4">
            Holdings
          </Typography>

          <Typography color="text.secondary">
            Monitor your investment portfolio
          </Typography>

        </div>

        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={() => window.print()}
        >
          Export
        </Button>

      </div>

      {/* Search */}

      <div className="holding-search">

        <TextField
          fullWidth
          placeholder="Search Holdings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

      </div>

      {/* Summary Cards */}

      <Grid container spacing={3}>

        <Grid item xs={12} md={3}>

          <Card className="summary-card">

            <CardContent>

              <AccountBalanceWalletRoundedIcon />

              <Typography>Total Investment</Typography>

              <h2>
                ₹{totalInvestment.toFixed(2)}
              </h2>

            </CardContent>

          </Card>

        </Grid>

        <Grid item xs={12} md={3}>

          <Card className="summary-card">

            <CardContent>

              <TrendingUpRoundedIcon />

              <Typography>Current Value</Typography>

              <h2>
                ₹{currentValue.toFixed(2)}
              </h2>

            </CardContent>

          </Card>

        </Grid>

        <Grid item xs={12} md={3}>

          <Card className="summary-card">

            <CardContent>

              <CurrencyRupeeRoundedIcon />

              <Typography>Total P&amp;L</Typography>

              <h2 className={totalProfit >= 0 ? "profit" : "loss"}>
                ₹{totalProfit.toFixed(2)}
              </h2>

            </CardContent>

          </Card>

        </Grid>

        <Grid item xs={12} md={3}>

          <Card className="summary-card">

            <CardContent>

              <PieChartRoundedIcon />

              <Typography>Returns</Typography>

              <h2 className={profitPercentage >= 0 ? "profit" : "loss"}>
                {profitPercentage.toFixed(2)}%
              </h2>

            </CardContent>

          </Card>

        </Grid>

      </Grid>

      {/* Table */}

      <Paper elevation={0} className="holdings-table">

        <TableContainer>

          <Table>

            <TableHead>

              <TableRow>

                <TableCell>Company</TableCell>

                <TableCell align="center">Qty</TableCell>

                <TableCell align="center">Avg Price</TableCell>

                <TableCell align="center">Current</TableCell>

                <TableCell align="center">Current Value</TableCell>

                <TableCell align="center">P&amp;L</TableCell>

                <TableCell align="center">Net</TableCell>

                <TableCell align="center">Day</TableCell>

              </TableRow>

            </TableHead>

            <TableBody>
              {filteredHoldings.map((stock, index) => {
                const currentVal = stock.price * stock.qty;
                const profit = currentVal - stock.avg * stock.qty;
                const isProfit = profit >= 0;
                const netStr = stock.net || "+0.00%";
                const dayStr = stock.day || "+0.00%";

                return (
                  <TableRow key={stock._id || index} hover>

                    <TableCell>

                      <div className="company-cell">

                        <Avatar className="company-avatar">
                          {stock.name.substring(0, 1)}
                        </Avatar>

                        <div>

                          <Typography variant="subtitle2">
                            {stock.name}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            NSE
                          </Typography>

                        </div>

                      </div>

                    </TableCell>

                    <TableCell align="center">
                      {stock.qty}
                    </TableCell>

                    <TableCell align="center">
                      ₹{stock.avg.toFixed(2)}
                    </TableCell>

                    <TableCell align="center">
                      ₹{stock.price.toFixed(2)}
                    </TableCell>

                    <TableCell align="center">
                      ₹{currentVal.toFixed(2)}
                    </TableCell>

                    <TableCell align="center">

                      <Chip
                        size="small"
                        icon={
                          isProfit ? (
                            <TrendingUpRoundedIcon />
                          ) : (
                            <TrendingDownRoundedIcon />
                          )
                        }
                        label={`₹${profit.toFixed(2)}`}
                        color={isProfit ? "success" : "error"}
                      />

                    </TableCell>

                    <TableCell align="center">

                      <Chip
                        label={netStr}
                        color={netStr.includes("-") ? "error" : "success"}
                        variant="outlined"
                      />

                    </TableCell>

                    <TableCell align="center">

                      <Chip
                        label={dayStr}
                        color={dayStr.includes("-") ? "error" : "success"}
                        variant="outlined"
                      />

                    </TableCell>

                  </TableRow>
                );
              })}
            </TableBody>

          </Table>

        </TableContainer>

      </Paper>

      <Grid container spacing={3} sx={{ marginTop: "20px" }}>

        <Grid item xs={12} lg={8}>

          <Paper className="graph-card" elevation={0}>

            <Typography variant="h6" mb={2}>
              Portfolio Performance
            </Typography>

            <VerticalGraph data={chartData} />

          </Paper>

        </Grid>

        <Grid item xs={12} lg={4}>

          <Paper className="portfolio-card" elevation={0}>

            <Typography variant="h6" mb={3}>
              Portfolio Summary
            </Typography>

            <div className="summary-row">
              <span>Total Holdings</span>
              <strong>{filteredHoldings.length}</strong>
            </div>

            <div className="summary-row">
              <span>Total Investment</span>
              <strong>₹{totalInvestment.toFixed(2)}</strong>
            </div>

            <div className="summary-row">
              <span>Current Value</span>
              <strong>₹{currentValue.toFixed(2)}</strong>
            </div>

            <div className="summary-row">
              <span>Total Returns</span>
              <strong className={totalProfit >= 0 ? "profit" : "loss"}>
                ₹{totalProfit.toFixed(2)}
              </strong>
            </div>

            <div className="summary-row">
              <span>Return %</span>
              <strong className={profitPercentage >= 0 ? "profit" : "loss"}>
                {profitPercentage.toFixed(2)}%
              </strong>
            </div>

          </Paper>

        </Grid>

      </Grid>
    </div>
  );
};

export default Holdings;
