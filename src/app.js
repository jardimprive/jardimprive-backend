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

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/variations', variationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/bonuses', bonusRoutes);
app.use('/api/commissions', commissionRoutes);
app.use('/dashboard', require('./routes/dashboard.routes'));
app.use('/api/mercadopago', mpRoutes);
app.use('/api/meta', require('./routes/meta.routes'));
app.use('/api/auth', authRoutes);
app.use('/api/logins', require('./routes/login.routes'));
app.use('/profile', profileRoutes);
app.use('/admin/export', require('./routes/export.routes'));
app.use('/notifications', require('./routes/notifications.routes'));
app.use('/admin', require('./routes/admin.routes')); // ✅ Rota de administração (vendedoras)
app.use('/api/hotel', require('./routes/hotel.routes'));
app.use('/api/leader', leaderRoutes);
app.use('/leader', teamLeaderRoutes);

app.get('/', (req, res) => {
  res.send('🌸 API Jardim Privé funcionando perfeitamente!');
});

module.exports = app;
