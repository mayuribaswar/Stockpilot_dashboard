import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Divider,
  Box,
  Avatar,
  InputAdornment,
} from "@mui/material";

import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import CurrencyRupeeRoundedIcon from "@mui/icons-material/CurrencyRupeeRounded";

import { watchlist } from "../data/data";
import "./TradeDialog.css";

const TradeDialog = ({
  open,
  onClose,
  mode,
  defaultStock = "",
  onOrderSuccess,
}) => {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(defaultStock);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedStock(defaultStock || "");
      setQuantity(1);
      setError("");

      axios
        .get("/allHoldings")
        .then((res) => {
          const userHoldings = Array.isArray(res.data) ? res.data : [];
          if (mode === "BUY") {
            const mergedMap = new Map();
            userHoldings.forEach((s) => mergedMap.set(s.name, s));
            watchlist.forEach((w) => {
              if (!mergedMap.has(w.name)) {
                mergedMap.set(w.name, { name: w.name, price: w.price, qty: 0 });
              }
            });
            setStocks(Array.from(mergedMap.values()));
          } else {
            setStocks(userHoldings);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [open, defaultStock, mode]);

  // Auto fill price when stock selection changes
  useEffect(() => {
    if (!selectedStock) return;

    const stock = stocks.find((s) => s.name === selectedStock);
    if (stock) {
      setPrice(stock.price);
    }
  }, [selectedStock, stocks]);

  const estimatedAmount = Number(quantity) * Number(price || 0);

  const handleTrade = async () => {
    setError("");

    if (!selectedStock) {
      setError("Please select a stock.");
      return;
    }

    if (quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    if (price <= 0) {
      setError("Price must be greater than zero.");
      return;
    }

    try {
      setLoading(true);

      await axios.post("/newOrder", {
        name: selectedStock,
        qty: Number(quantity),
        price: Number(price),
        mode: mode,
      });

      setLoading(false);

      if (typeof onOrderSuccess === "function") {
        await onOrderSuccess();
      }

      onClose();
    } catch (err) {
      setLoading(false);
      console.log(err);

      if (err.response && err.response.data) {
        setError(err.response.data.message || "Trade failed.");
      } else {
        setError("Unable to connect to server.");
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              bgcolor: mode === "BUY" ? "#16a34a" : "#dc2626",
            }}
          >
            {mode === "BUY" ? (
              <TrendingUpRoundedIcon />
            ) : (
              <TrendingDownRoundedIcon />
            )}
          </Avatar>

          <Box>
            <Typography variant="h6" fontWeight="bold">
              {mode} Stock
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Place a {mode.toLowerCase()} order
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {/* Stock Dropdown */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Select Stock"
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
            >
              {stocks.map((stock) => (
                <MenuItem key={stock.name} value={stock.name}>
                  {stock.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Quantity */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Quantity"
              value={quantity}
              inputProps={{ min: 1 }}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </Grid>

          {/* Price */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CurrencyRupeeRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Estimated Amount */}
          <Grid item xs={12}>
            <Box className="trade-summary">
              <Typography variant="subtitle2" color="text.secondary">
                Estimated Value
              </Typography>

              <Typography variant="h5" fontWeight="bold">
                ₹ {estimatedAmount.toFixed(2)}
              </Typography>
            </Box>
          </Grid>

          {/* Error */}
          {error && (
            <Grid item xs={12}>
              <Typography color="error" fontWeight="600">
                {error}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={loading}
          sx={{
            textTransform: "none",
            borderRadius: "10px",
            minWidth: "120px",
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          color={mode === "BUY" ? "success" : "error"}
          disabled={loading}
          onClick={handleTrade}
          sx={{
            textTransform: "none",
            borderRadius: "10px",
            minWidth: "140px",
            fontWeight: 600,
          }}
        >
          {loading
            ? "Processing..."
            : mode === "BUY"
            ? "Buy Stock"
            : "Sell Stock"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TradeDialog;
