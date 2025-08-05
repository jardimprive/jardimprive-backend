const express = require("express");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/user.routes");
const orderRoutes = require("./routes/order.routes");
const mpRoutes = require("./routes/mercadopago.routes");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const profileRoutes = require("./routes/profile.routes");

const app = express();

// ✅ CORS dinâmico baseado em variáveis de ambiente
app.use(cors());

// ✅ Middleware para rawBody no webhook
app.use(
  "/api/mercadopago/webhook",
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

// ✅ Middleware padrão
app.use(express.json());

// ✅ Log de todas as requisições
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// ✅ ROTAS COM PREFIXO CONSISTENTE
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/mercadopago", mpRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => {
  res.send("🌸 API Jardim Privé funcionando perfeitamente!");
});

module.exports = app;


