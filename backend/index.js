const path = require("path");
require("dotenv").config();
require("dotenv").config({ path: path.join(__dirname, ".env") });

const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const { JWT_SECRET } = require("./middleware/auth");
const { UserModel } = require("./model/UserModel");
const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");

const PORT = Number(process.env.PORT) || 3000;
const uri = process.env.MONGO_URL || process.env.MONGODB_URI;

mongoose.set("bufferCommands", false);
if (uri) {
  mongoose
    .connect(uri)
    .then(() => console.log("MongoDB connected"))
    .catch((err) =>
      console.warn("MongoDB not connected — using local persistent store:", err.message)
    );
} else {
  console.warn("MONGO_URL not set — using local persistent store");
}

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Default starter holdings and positions for each user's portfolio
const DEFAULT_HOLDINGS = [
  {
    name: "BHARTIARTL",
    qty: 2,
    avg: 538.05,
    price: 541.15,
    net: "+0.58%",
    day: "+2.99%",
  },
  {
    name: "HDFCBANK",
    qty: 2,
    avg: 1383.4,
    price: 1522.35,
    net: "+10.04%",
    day: "+0.11%",
  },
  {
    name: "HINDUNILVR",
    qty: 1,
    avg: 2335.85,
    price: 2417.4,
    net: "+3.49%",
    day: "+0.21%",
  },
  {
    name: "INFY",
    qty: 1,
    avg: 1350.5,
    price: 1555.45,
    net: "+15.18%",
    day: "-1.60%",
  },
  {
    name: "ITC",
    qty: 5,
    avg: 202.0,
    price: 207.9,
    net: "+2.92%",
    day: "+0.80%",
  },
  {
    name: "KPITTECH",
    qty: 5,
    avg: 250.3,
    price: 266.45,
    net: "+6.45%",
    day: "+3.54%",
  },
  {
    name: "M&M",
    qty: 2,
    avg: 809.9,
    price: 779.8,
    net: "-3.72%",
    day: "-0.01%",
  },
  {
    name: "RELIANCE",
    qty: 1,
    avg: 2193.7,
    price: 2112.4,
    net: "-3.71%",
    day: "+1.44%",
  },
  {
    name: "SBIN",
    qty: 4,
    avg: 324.35,
    price: 430.2,
    net: "+32.63%",
    day: "-0.34%",
  },
  {
    name: "SGBMAY29",
    qty: 2,
    avg: 4727.0,
    price: 4719.0,
    net: "-0.17%",
    day: "+0.15%",
  },
  {
    name: "TATAPOWER",
    qty: 5,
    avg: 104.2,
    price: 124.15,
    net: "+19.15%",
    day: "-0.24%",
  },
  {
    name: "TCS",
    qty: 1,
    avg: 3041.7,
    price: 3194.8,
    net: "+5.03%",
    day: "-0.25%",
  },
  {
    name: "WIPRO",
    qty: 4,
    avg: 489.3,
    price: 577.75,
    net: "+18.08%",
    day: "+0.32%",
  },
];

const DEFAULT_POSITIONS = [
  {
    product: "CNC",
    name: "EVEREADY",
    qty: 2,
    avg: 316.27,
    price: 312.35,
    net: "+0.58%",
    day: "-1.24%",
    isLoss: true,
  },
  {
    product: "CNC",
    name: "JUBLFOOD",
    qty: 1,
    avg: 3124.75,
    price: 3082.65,
    net: "+10.04%",
    day: "-1.35%",
    isLoss: true,
  },
];

// Local persistent store when external MongoDB is offline
const DATA_DIR = path.join(__dirname, "../.data");
const DB_FILE = path.join(DATA_DIR, "stockpilot-db.json");

function loadStore() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    }
  } catch (err) {
    console.warn("Could not read local store, initializing empty:", err.message);
  }
  return {
    users: [],
    holdings: [],
    positions: [],
    orders: [],
  };
}

function saveStore(store) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not save local store:", err.message);
  }
}

const localStore = loadStore();

async function ensureUserPortfolioSeeded(userId) {
  const uid = String(userId);
  if (isMongoConnected()) {
    const existingHoldingsCount = await HoldingsModel.countDocuments({ userId: uid });
    const existingOrdersCount = await OrdersModel.countDocuments({ userId: uid });
    if (existingHoldingsCount === 0 && existingOrdersCount === 0) {
      await HoldingsModel.insertMany(
        DEFAULT_HOLDINGS.map((item) => ({
          userId: uid,
          name: item.name,
          qty: item.qty,
          avg: item.avg,
          price: item.price,
          net: item.net,
          day: item.day,
        }))
      );
    }
    const existingPositionsCount = await PositionsModel.countDocuments({ userId: uid });
    if (existingPositionsCount === 0) {
      await PositionsModel.insertMany(
        DEFAULT_POSITIONS.map((item) => ({
          userId: uid,
          product: item.product,
          name: item.name,
          qty: item.qty,
          avg: item.avg,
          price: item.price,
          net: item.net,
          day: item.day,
          isLoss: item.isLoss,
        }))
      );
    }
  } else {
    const hasHoldings = localStore.holdings.some((h) => h.userId === uid);
    const hasOrders = localStore.orders.some((o) => o.userId === uid);
    let mutated = false;

    if (!hasHoldings && !hasOrders) {
      DEFAULT_HOLDINGS.forEach((item) => {
        localStore.holdings.push({
          _id: crypto.randomUUID(),
          userId: uid,
          name: item.name,
          qty: item.qty,
          avg: item.avg,
          price: item.price,
          net: item.net,
          day: item.day,
        });
      });
      mutated = true;
    }

    const hasPositions = localStore.positions.some((p) => p.userId === uid);
    if (!hasPositions) {
      DEFAULT_POSITIONS.forEach((item) => {
        localStore.positions.push({
          _id: crypto.randomUUID(),
          userId: uid,
          product: item.product,
          name: item.name,
          qty: item.qty,
          avg: item.avg,
          price: item.price,
          net: item.net,
          day: item.day,
          isLoss: item.isLoss,
        });
      });
      mutated = true;
    }

    if (mutated) {
      saveStore(localStore);
    }
  }
}

const app = express();

app.use(cors());
app.use(bodyParser.json());

// ======================================================
// AUTHENTICATION ROUTES
// ======================================================

const handleRegister = async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 4 characters",
      });
    }

    let createdUser;

    if (isMongoConnected()) {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new UserModel({
        name,
        email,
        password: hashedPassword,
        availableCash: 3740,
        setupComplete: false,
      });

      await newUser.save();
      createdUser = {
        id: String(newUser._id),
        name: newUser.name,
        email: newUser.email,
        availableCash: newUser.availableCash,
        setupComplete: newUser.setupComplete,
      };
    } else {
      const existingUser = localStore.users.find(
        (u) => u.email.toLowerCase() === email
      );
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        _id: crypto.randomUUID(),
        name,
        email,
        password: hashedPassword,
        availableCash: 3740,
        setupComplete: false,
        createdAt: new Date().toISOString(),
      };

      localStore.users.push(newUser);
      saveStore(localStore);

      createdUser = {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        availableCash: newUser.availableCash,
        setupComplete: newUser.setupComplete,
      };
    }

    await ensureUserPortfolioSeeded(createdUser.id);

    const token = jwt.sign(
      {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      token,
      user: createdUser,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const handleLogin = async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    let userRecord;

    if (isMongoConnected()) {
      userRecord = await UserModel.findOne({ email });
    } else {
      userRecord = localStore.users.find(
        (u) => u.email.toLowerCase() === email
      );
    }

    if (!userRecord) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const isMatch = await bcrypt.compare(password, userRecord.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const userId = String(userRecord._id);
    await ensureUserPortfolioSeeded(userId);

    const token = jwt.sign(
      {
        id: userId,
        email: userRecord.email,
        name: userRecord.name,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: userId,
        name: userRecord.name,
        email: userRecord.email,
        availableCash: userRecord.availableCash ?? 3740,
        setupComplete: userRecord.setupComplete ?? true,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

app.post("/register", handleRegister);
app.post("/api/auth/register", handleRegister);

app.post("/login", handleLogin);
app.post("/api/auth/login", handleLogin);

app.get("/me", auth, async (req, res) => {
  try {
    const userId = String(req.user.id);
    let userRecord;

    if (isMongoConnected()) {
      userRecord = await UserModel.findById(userId);
    } else {
      userRecord = localStore.users.find((u) => String(u._id) === userId);
    }

    if (!userRecord) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: String(userRecord._id),
        name: userRecord.name,
        email: userRecord.email,
        availableCash: userRecord.availableCash ?? 3740,
        setupComplete: userRecord.setupComplete ?? true,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
});

app.post("/setup-account", auth, async (req, res) => {
  try {
    const userId = String(req.user.id);
    const initialCash =
      req.body.availableCash !== undefined
        ? Number(req.body.availableCash)
        : 3740;

    if (isMongoConnected()) {
      const userRecord = await UserModel.findByIdAndUpdate(
        userId,
        {
          availableCash: isNaN(initialCash) ? 3740 : initialCash,
          setupComplete: true,
        },
        { new: true }
      );
      if (!userRecord) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      return res.json({
        success: true,
        user: {
          id: String(userRecord._id),
          name: userRecord.name,
          email: userRecord.email,
          availableCash: userRecord.availableCash,
          setupComplete: true,
        },
      });
    } else {
      const userRecord = localStore.users.find((u) => String(u._id) === userId);
      if (!userRecord) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      userRecord.availableCash = isNaN(initialCash) ? 3740 : initialCash;
      userRecord.setupComplete = true;
      saveStore(localStore);
      return res.json({
        success: true,
        user: {
          id: String(userRecord._id),
          name: userRecord.name,
          email: userRecord.email,
          availableCash: userRecord.availableCash,
          setupComplete: true,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to complete account setup",
    });
  }
});

app.post("/logout", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// ======================================================
// PROTECTED USER-SPECIFIC PORTFOLIO ROUTES
// ======================================================

app.get("/allHoldings", auth, async (req, res) => {
  try {
    const userId = String(req.user.id);
    await ensureUserPortfolioSeeded(userId);

    if (isMongoConnected()) {
      const allHoldings = await HoldingsModel.find({ userId });
      return res.json(allHoldings);
    } else {
      const userHoldings = localStore.holdings.filter((h) => h.userId === userId);
      return res.json(userHoldings);
    }
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch holdings" });
  }
});

app.get("/allPositions", auth, async (req, res) => {
  try {
    const userId = String(req.user.id);
    await ensureUserPortfolioSeeded(userId);

    if (isMongoConnected()) {
      const allPositions = await PositionsModel.find({ userId });
      return res.json(allPositions);
    } else {
      const userPositions = localStore.positions.filter((p) => p.userId === userId);
      return res.json(userPositions);
    }
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch positions" });
  }
});

app.get("/allOrders", auth, async (req, res) => {
  try {
    const userId = String(req.user.id);

    if (isMongoConnected()) {
      const orders = await OrdersModel.find({ userId }).sort({ createdAt: -1 });
      return res.json(orders);
    } else {
      const userOrders = localStore.orders
        .filter((o) => o.userId === userId)
        .slice()
        .reverse();
      return res.json(userOrders);
    }
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
});

app.post("/newOrder", auth, async (req, res) => {
  try {
    const userId = String(req.user.id);
    const name = req.body.name;
    const qty = Number(req.body.qty);
    const price = Number(req.body.price);
    const mode = req.body.mode;

    if (!name || isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
      return res.status(400).json({
        message: "Valid stock name, quantity, and price are required",
      });
    }

    if (mode !== "BUY" && mode !== "SELL") {
      return res.status(400).json({
        message: "Order mode must be BUY or SELL",
      });
    }

    await ensureUserPortfolioSeeded(userId);

    if (isMongoConnected()) {
      const holding = await HoldingsModel.findOne({ userId, name });

      if (mode === "BUY") {
        if (holding) {
          const totalQty = holding.qty + qty;
          const avgPrice = (holding.qty * holding.avg + qty * price) / totalQty;
          const diffPct = avgPrice > 0 ? ((price - avgPrice) / avgPrice) * 100 : 0;
          holding.qty = totalQty;
          holding.avg = avgPrice;
          holding.price = price;
          holding.net = `${diffPct >= 0 ? "+" : ""}${diffPct.toFixed(2)}%`;
          await holding.save();
        } else {
          const newHolding = new HoldingsModel({
            userId,
            name,
            qty,
            avg: price,
            price,
            net: "+0.00%",
            day: "+0.00%",
          });
          await newHolding.save();
        }
      } else if (mode === "SELL") {
        if (!holding) {
          return res.status(400).json({
            message: "Stock not found in holdings",
          });
        }
        if (holding.qty < qty) {
          return res.status(400).json({
            message: "Insufficient Quantity",
          });
        }
        holding.qty -= qty;
        holding.price = price;
        if (holding.qty === 0) {
          await HoldingsModel.deleteOne({ _id: holding._id, userId });
        } else {
          await holding.save();
        }
      }

      const newOrder = new OrdersModel({
        userId,
        name,
        qty,
        price,
        mode,
      });
      await newOrder.save();

      return res.status(201).json({ message: "Order saved!", order: newOrder });
    } else {
      const holdingIndex = localStore.holdings.findIndex(
        (h) => h.userId === userId && h.name === name
      );
      const holding = holdingIndex >= 0 ? localStore.holdings[holdingIndex] : null;

      if (mode === "BUY") {
        if (holding) {
          const totalQty = holding.qty + qty;
          const avgPrice = (holding.qty * holding.avg + qty * price) / totalQty;
          const diffPct = avgPrice > 0 ? ((price - avgPrice) / avgPrice) * 100 : 0;
          holding.qty = totalQty;
          holding.avg = avgPrice;
          holding.price = price;
          holding.net = `${diffPct >= 0 ? "+" : ""}${diffPct.toFixed(2)}%`;
        } else {
          localStore.holdings.push({
            _id: crypto.randomUUID(),
            userId,
            name,
            qty,
            avg: price,
            price,
            net: "+0.00%",
            day: "+0.00%",
          });
        }
      } else if (mode === "SELL") {
        if (!holding) {
          return res.status(400).json({
            message: "Stock not found in holdings",
          });
        }
        if (holding.qty < qty) {
          return res.status(400).json({
            message: "Insufficient Quantity",
          });
        }
        holding.qty -= qty;
        holding.price = price;
        if (holding.qty === 0) {
          localStore.holdings.splice(holdingIndex, 1);
        }
      }

      const userRecord = localStore.users.find((u) => String(u._id) === userId);
      if (userRecord) {
        const orderAmount = qty * price;
        if (mode === "BUY") {
          userRecord.availableCash = Math.max(
            0,
            (userRecord.availableCash ?? 3740) - orderAmount
          );
        } else {
          userRecord.availableCash = (userRecord.availableCash ?? 3740) + orderAmount;
        }
      }

      const savedOrder = {
        _id: crypto.randomUUID(),
        userId,
        name,
        qty,
        price,
        mode,
        createdAt: new Date().toISOString(),
      };
      localStore.orders.push(savedOrder);
      saveStore(localStore);

      return res.status(201).json({ message: "Order saved!", order: savedOrder });
    }
  } catch (err) {
    console.error("Order error:", err);
    return res.status(500).json({ message: "Failed to process order" });
  }
});

// ======================================================
// STATIC BUILDS & SPA ROUTING (PORT 3000)
// ======================================================

const dashboardBuildPath = path.join(__dirname, "../dashboard/build");

// Convenience redirects
app.get("/portfolio", (req, res) => res.redirect("/holdings"));
app.get("/profile", (req, res) => res.redirect("/"));
app.get(["/dashboard", "/dashboard/*"], (req, res) => res.redirect("/"));

// Serve Dashboard app directly at /
app.use(express.static(dashboardBuildPath));
app.get("*", (req, res) => {
  const file = path.join(dashboardBuildPath, "index.html");
  if (fs.existsSync(file)) {
    res.sendFile(file);
  } else {
    res
      .status(503)
      .send("StockPilot Dashboard is initializing... Please refresh shortly.");
  }
});

// Express error fallback middleware
app.use((err, req, res, next) => {
  if (
    err.name === "MongooseError" ||
    err.name === "MongoNetworkError" ||
    (err.message && err.message.includes("buffering timed out"))
  ) {
    console.warn("[AI Studio] Database offline — returning mock empty response");
    if (req.method === "GET") {
      return res.json(req.path.endsWith("s") || req.path.endsWith("s/") ? [] : {});
    }
    return res
      .status(503)
      .json({ error: "Service temporarily unavailable (database offline)" });
  }
  next(err);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`StockPilot server running on http://0.0.0.0:${PORT}`);
});
