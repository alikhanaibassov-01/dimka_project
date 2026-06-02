const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

function validatePhone(phone) {
  const cleaned = phone.replace(/\s/g, '');
  return /^\+?7?\d{10,11}$/.test(cleaned) || /^8\d{10}$/.test(cleaned);
}

router.post('/', (req, res, next) => {
  try {
    const { customerName, phone, city, address, comment, items } = req.body;

    if (!customerName?.trim() || !phone?.trim() || !city?.trim() || !address?.trim()) {
      return res.status(400).json({ error: 'Барлық міндетті өрістерді толтырыңыз / Заполните обязательные поля' });
    }
    if (!validatePhone(phone)) {
      return res.status(400).json({ error: 'Телефон нөмірі дұрыс емес / Некорректный номер телефона' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Себет бос / Корзина пуста' });
    }

    const db = getDb();
    let total = 0;
    const lineItems = [];

    const getProduct = db.prepare('SELECT id, price, in_stock FROM products WHERE id = ?');

    for (const item of items) {
      const productId = Number(item.productId);
      const qty = Number(item.qty);
      if (!productId || !qty || qty < 1) {
        return res.status(400).json({ error: 'Себеттегі тауар дұрыс емес / Некорректная позиция в корзине' });
      }
      const product = getProduct.get(productId);
      if (!product || !product.in_stock) {
        return res.status(400).json({ error: `Тауар #${productId} қолжетімсіз / Товар недоступен` });
      }
      total += product.price * qty;
      lineItems.push({ productId, qty, price: product.price });
    }

    const insertOrder = db.prepare(`
      INSERT INTO orders (customer_name, phone, city, address, comment, total, status)
      VALUES (?, ?, ?, ?, ?, ?, 'new')
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
      return orderId;
    });

    const orderId = transaction();

    res.status(201).json({ orderId, total });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
