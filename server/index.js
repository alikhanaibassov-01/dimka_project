require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const { ensureDb } = require('./setup-db');
const errorHandler = require('./middleware/errorHandler');
const categoriesRouter = require('./routes/categories');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const uploadRouter = require('./routes/upload');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

ensureDb();

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'qazmarket-dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/upload', uploadRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`QazMarketplace: http://localhost:${PORT}`);
});
