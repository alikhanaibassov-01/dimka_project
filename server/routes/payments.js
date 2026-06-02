const express = require('express');
const Stripe = require('stripe');
const { getDb } = require('../db');

const router = express.Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

function validatePhone(phone) {
  const cleaned = phone.replace(/\s/g, '');
  return /^\+?7?\d{10,11}$/.test(cleaned) || /^8\d{10}$/.test(cleaned);
}

function createPendingOrder(db, body) {
  const { customerName, phone, city, address, comment, items } = body;

  if (!customerName?.trim() || !phone?.trim() || !city?.trim() || !address?.trim()) {
    throw Object.assign(new Error('Заполните обязательные поля / Міндетті өрістерді толтырыңыз'), { status: 400 });
  }
  if (!validatePhone(phone)) {
    throw Object.assign(new Error('Некорректный номер телефона / Телефон дұрыс емес'), { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw Object.assign(new Error('Корзина пуста / Себет бос'), { status: 400 });
  }

  let total = 0;
  const lineItems = [];
  const getProduct = db.prepare('SELECT id, price, in_stock, name_ru FROM products WHERE id = ?');

  for (const item of items) {
    const productId = Number(item.productId);
    const qty = Number(item.qty);
    if (!productId || !qty || qty < 1) {
      throw Object.assign(new Error('Некорректная позиция / Қате тауар'), { status: 400 });
    }
    const product = getProduct.get(productId);
    if (!product || !product.in_stock) {
      throw Object.assign(new Error(`Товар #${productId} недоступен`), { status: 400 });
    }
    total += product.price * qty;
    lineItems.push({ productId, qty, price: product.price, name: product.name_ru });
  }

  const insertOrder = db.prepare(`
    INSERT INTO orders (customer_name, phone, city, address, comment, total, status, payment_status)
    VALUES (?, ?, ?, ?, ?, ?, 'new', 'pending')
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, qty, price_at_order)
    VALUES (?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    const result = insertOrder.run(
      customerName.trim(),
      phone.trim(),
      city.trim(),
      address.trim(),
      comment?.trim() || null,
      total
    );
    const orderId = result.lastInsertRowid;
    for (const line of lineItems) {
      insertItem.run(orderId, line.productId, line.qty, line.price);
    }
    return { orderId, total, lineItems };
  });

  return transaction();
}

async function handleWebhook(req, res) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return res.status(503).send('Stripe webhook not configured');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const db = getDb();
      db.prepare(`
        UPDATE orders SET payment_status = 'paid', status = 'paid'
        WHERE id = ?
      `).run(orderId);
    }
  }

  res.json({ received: true });
}

router.post('/create-session', async (req, res, next) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe не настроен. Добавьте STRIPE_SECRET_KEY в .env' });
    }

    const db = getDb();
    const { orderId, total, lineItems } = createPendingOrder(db, req.body);
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const currency = process.env.STRIPE_CURRENCY || 'kzt';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems.map((line) => ({
        price_data: {
          currency,
          product_data: { name: line.name },
          unit_amount: line.price * 100,
        },
        quantity: line.qty,
      })),
      metadata: { orderId: String(orderId) },
      success_url: `${baseUrl}/order-success.html?orderId=${orderId}`,
      cancel_url: `${baseUrl}/checkout.html?cancelled=1`,
    });

    db.prepare('UPDATE orders SET stripe_session_id = ? WHERE id = ?').run(session.id, orderId);

    res.json({ url: session.url, orderId, total });
  } catch (err) {
    next(err);
  }
});

router.get('/verify/:id', async (req, res, next) => {
  try {
    const stripe = getStripe();
    const db = getDb();
    const order = db.prepare('SELECT id, total, payment_status, stripe_session_id FROM orders WHERE id = ?').get(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    if (order.payment_status === 'paid') {
      return res.json({ orderId: order.id, total: order.total, paymentStatus: 'paid' });
    }

    if (stripe && order.stripe_session_id) {
      const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
      if (session.payment_status === 'paid') {
        db.prepare(`UPDATE orders SET payment_status = 'paid', status = 'paid' WHERE id = ?`).run(order.id);
        return res.json({ orderId: order.id, total: order.total, paymentStatus: 'paid' });
      }
    }

    res.json({ orderId: order.id, total: order.total, paymentStatus: order.payment_status });
  } catch (err) {
    next(err);
  }
});

router.get('/order/:id', (req, res) => {
  const db = getDb();
  const order = db.prepare(`
    SELECT id, total, payment_status, customer_name, created_at
    FROM orders WHERE id = ?
  `).get(req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Заказ не найден' });
  }
  res.json({
    orderId: order.id,
    total: order.total,
    paymentStatus: order.payment_status,
    customerName: order.customer_name,
  });
});

module.exports = router;
module.exports.handleWebhook = handleWebhook;
