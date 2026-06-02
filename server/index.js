require('dotenv').config();

const express = require('express');
const path = require('path');
const { ensureDb } = require('./setup-db');
const errorHandler = require('./middleware/errorHandler');
const categoriesRouter = require('./routes/categories');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const uploadRouter = require('./routes/upload');
const paymentsRouter = require('./routes/payments');
const { handleWebhook } = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 3000;

ensureDb();

app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/payments', paymentsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`QazMarketplace: http://localhost:${PORT}`);
});
