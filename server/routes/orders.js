const express = require('express');
const { getDb } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const PICKUP_CITY = 'Алматы';
const PICKUP_ADDRESS = 'пр. Аль-Фараби, 93';

function validatePhone(phone) {
  const cleaned = phone.replace(/\s/g, '');
  return /^\+?7?\d{10,11}$/.test(cleaned) || /^8\d{10}$/.test(cleaned);
}

function createOrder(db, body, userId = null) {
  const {
    firstName,
    lastName,
    customerName,
    phone,
    city,
    address,
    comment,
    items,
    paymentMethod,
    deliveryMethod,
  } = body;

  const isPickup = deliveryMethod === 'pickup';
  const fName = firstName?.trim() || '';
  const lName = lastName?.trim() || '';
  const fullName = [lName, fName].filter(Boolean).join(' ') || customerName?.trim() || '';

  if (!fullName || !phone?.trim()) {
    throw Object.assign(new Error('Заполните ФИО и телефон / Аты-жөні мен телефон'), { status: 400 });
  }
  if (!validatePhone(phone)) {
    throw Object.assign(new Error('Некорректный номер телефона / Телефон дұрыс емес'), { status: 400 });
  }
  if (!isPickup && (!city?.trim() || !address?.trim())) {
    throw Object.assign(new Error('Заполните город и адрес / Қала мен мекенжай'), { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw Object.assign(new Error('Корзина пуста / Себет бос'), { status: 400 });
  }

  const method = paymentMethod === 'kaspi' ? 'kaspi' : 'cod';
  const paymentStatus = method === 'kaspi' ? 'awaiting_kaspi' : 'cod';
  const finalCity = isPickup ? PICKUP_CITY : city.trim();
  const finalAddress = isPickup ? `${PICKUP_ADDRESS} (самовывоз)` : address.trim();

  let total = 0;
  const lineItems = [];
  const getProduct = db.prepare(
    'SELECT id, price, in_stock, name_ru FROM products WHERE id = ? AND deleted = 0'
  );

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
    INSERT INTO orders (
      user_id, customer_name, phone, city, address, comment,
      total, status, payment_status, payment_method, delivery_method
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?)
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, qty, price_at_order)
    VALUES (?, ?, ?, ?)
  `);

  const delivery = isPickup ? 'pickup' : 'delivery';

  return db.transaction(() => {
    const result = insertOrder.run(
      userId,
      fullName,
      phone.trim(),
      finalCity,
      finalAddress,
      comment?.trim() || null,
      total,
      paymentStatus,
      method,
      delivery
    );
    const orderId = result.lastInsertRowid;
    for (const line of lineItems) {
      insertItem.run(orderId, line.productId, line.qty, line.price);
    }
    return { orderId, total, paymentMethod: method, paymentStatus, deliveryMethod: delivery };
  })();
}

router.post('/', (req, res, next) => {
  try {
    const db = getDb();
    const userId = req.session?.userId || null;
    const result = createOrder(db, req.body, userId);

    const kaspiPhone = process.env.KASPI_PHONE || '+77001234567';
    const kaspiName = process.env.KASPI_RECIPIENT || 'QazMarket';

    res.status(201).json({
      orderId: result.orderId,
      total: result.total,
      paymentMethod: result.paymentMethod,
      paymentStatus: result.paymentStatus,
      deliveryMethod: result.deliveryMethod,
      kaspiPhone: result.paymentMethod === 'kaspi' ? kaspiPhone : undefined,
      kaspiRecipient: result.paymentMethod === 'kaspi' ? kaspiName : undefined,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/mine', requireAuth, (req, res) => {
  const db = getDb();
  const orders = db
    .prepare(
      `SELECT id, created_at, total, status, payment_status, payment_method, delivery_method, city, address
       FROM orders WHERE user_id = ? ORDER BY id DESC`
    )
    .all(req.session.userId);
  res.json(orders);
});

router.get('/admin', requireAdmin, (req, res) => {
  const db = getDb();
  const orders = db
    .prepare(
      `SELECT id, created_at, customer_name, phone, total, status, payment_status, payment_method, delivery_method, city, address
       FROM orders ORDER BY id DESC LIMIT 100`
    )
    .all();
  res.json(orders);
});

router.patch('/:id/payment', requireAdmin, (req, res) => {
  const db = getDb();
  const id = Number(req.params.id);
  const { paymentStatus } = req.body;

  const allowed = ['paid', 'awaiting_kaspi', 'cod', 'cancelled'];
  if (!allowed.includes(paymentStatus)) {
    return res.status(400).json({ error: 'Invalid payment status' });
  }

  const order = db.prepare('SELECT id FROM orders WHERE id = ?').get(id);
  if (!order) {
    return res.status(404).json({ error: 'Заказ не найден' });
  }

  const status = paymentStatus === 'paid' ? 'paid' : undefined;
  if (status) {
    db.prepare(`UPDATE orders SET payment_status = ?, status = ? WHERE id = ?`).run(paymentStatus, status, id);
  } else {
    db.prepare(`UPDATE orders SET payment_status = ? WHERE id = ?`).run(paymentStatus, id);
  }

  res.json({ ok: true });
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const order = db
    .prepare(
      `SELECT id, total, payment_status, payment_method, delivery_method, customer_name, city, address, created_at, user_id
       FROM orders WHERE id = ?`
    )
    .get(req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Заказ не найден' });
  }

  const kaspiPhone = process.env.KASPI_PHONE || '+77001234567';
  const kaspiName = process.env.KASPI_RECIPIENT || 'QazMarket';

  res.json({
    orderId: order.id,
    total: order.total,
    paymentStatus: order.payment_status,
    paymentMethod: order.payment_method,
    deliveryMethod: order.delivery_method,
    customerName: order.customer_name,
    city: order.city,
    address: order.address,
    kaspiPhone: order.payment_method === 'kaspi' ? kaspiPhone : undefined,
    kaspiRecipient: order.payment_method === 'kaspi' ? kaspiName : undefined,
    pickupAddress: PICKUP_ADDRESS,
    pickupCity: PICKUP_CITY,
  });
});

module.exports = router;
