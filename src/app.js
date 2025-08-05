// IMPORTS
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// ROTAS
const userRoutes = require("./routes/user.routes");
const orderRoutes = require("./routes/order.routes");
const mpRoutes = require("./routes/mercadopago.routes");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const profileRoutes = require("./routes/profile.routes");

const bonusRoutes = require("./routes/bonus.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const adminRoutes = require("./routes/admin.routes");
const commissionRoutes = require("./routes/commission.routes");
const exportRoutes = require("./routes/export.routes");
const hotelRoutes = require("./routes/hotel.routes");
const leaderRoutes = require("./routes/leader.routes");
const metaRoutes = require("./routes/meta.routes");
const notificationsRoutes = require("./routes/notifications.routes");
const paymentRoutes = require("./routes/payment.routes");
const teamleaderRoutes = require("./routes/teamleader.routes");
const variationRoutes = require("./routes/variation.routes");
const withdrawalRoutes = require("./routes/withdrawal.routes");
// const loginRoutes = require("./routes/login.routes"); // verificar duplicidade com auth.routes

const app = express();

app.use(cors());

app.use(
  "/api/mercadopago/webhook",
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// ROTAS
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/mercadopago", mpRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/profile", profileRoutes);

app.use("/api/bonus", bonusRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/commissions", commissionRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/hotel", hotelRoutes);
app.use("/api/leader", leaderRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/teamleader", teamleaderRoutes);
app.use("/api/variations", variationRoutes);
app.use("/api/withdrawals", withdrawalRoutes);

// app.use("/api/login", loginRoutes); // ⚠️ VERIFIQUE SE É NECESSÁRIO

app.get("/", (req, res) => {
  res.send("🌸 API Jardim Privé funcionando perfeitamente!");
});

module.exports = app;
