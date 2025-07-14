const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const variationRoutes = require('./routes/variation.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const withdrawalRoutes = require('./routes/withdrawal.routes');
const bonusRoutes = require('./routes/bonus.routes');
const commissionRoutes = require('./routes/commission.routes');
const mpRoutes = require('./routes/mercadopago.routes');
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const leaderRoutes = require('./routes/leader.routes');
const teamLeaderRoutes = require('./routes/teamLeader.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const loginRoutes = require('./routes/login.routes');
const exportRoutes = require('./routes/export.routes');
const adminRoutes = require('./routes/admin.routes');
const hotelRoutes = require('./routes/hotel.routes');
const metaRoutes = require('./routes/meta.routes');
const notificationRoutes = require('./routes/notifications.routes');

const app = express();

// ✅ CORS dinâmico baseado em variáveis de ambiente
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ✅ Middleware para rawBody no webhook
app.use(
  '/api/mercadopago/webhook',
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

// ✅ Middleware padrão
app.use(express.json());

// ✅ ROTAS COM PREFIXO CONSISTENTE
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/variations', variationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/bonuses', bonusRoutes);
app.use('/api/commission', commissionRoutes); // 🔧 CORRIGIDO
app.use('/api/notifications', notificationRoutes); // 🔧 CORRIGIDO
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/mercadopago', mpRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/login', loginRoutes); // 🔧 renomeado (era plural)
app.use('/api/profile', profileRoutes); // 🔧 CORRIGIDO
app.use('/api/export', exportRoutes); // 🔧 CORRIGIDO
app.use('/api/admin', adminRoutes); // 🔧 CORRIGIDO
app.use('/api/hotel', hotelRoutes);
app.use('/api/leader', leaderRoutes);
app.use('/api/team-leader', teamLeaderRoutes);

app.get('/', (req, res) => {
  res.send('🌸 API Jardim Privé funcionando perfeitamente!');
});

module.exports = app;
