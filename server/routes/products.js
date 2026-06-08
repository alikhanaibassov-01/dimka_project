const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

function mapProduct(row) {
  return {
    id: row.id,
    categoryId: row.category_id,
    nameKk: row.name_kk,
    nameRu: row.name_ru,
    descriptionKk: row.description_kk,
    descriptionRu: row.description_ru,
    price: row.price,
    region: row.region,
    producerName: row.producer_name,
    imageUrl: row.image_url,
    badge: row.badge,
    inStock: Boolean(row.in_stock),
    featured: Boolean(row.featured),
  };
}

router.get('/', (req, res) => {
  const db = getDb();
  const { category, region, q, minPrice, maxPrice, sort = 'id', page = '1', limit = '20', featured, all } = req.query;

  const conditions = [];
  const params = [];

  if (all !== '1') {
    conditions.push('in_stock = 1');
  }

  if (category) {
    conditions.push('category_id = (SELECT id FROM categories WHERE slug = ?)');
    params.push(category);
  }
  if (region) {
    conditions.push('region = ?');
    params.push(region);
  }
  if (q) {
    conditions.push('(name_kk LIKE ? OR name_ru LIKE ?)');
    const term = `%${q}%`;
    params.push(term, term);
  }
  if (minPrice) {
    conditions.push('price >= ?');
    params.push(Number(minPrice));
  }
  if (maxPrice) {
    conditions.push('price <= ?');
    params.push(Number(maxPrice));
  }
  if (featured === '1') {
    conditions.push('featured = 1');
  }

  const sortMap = {
    id: 'id ASC',
    price_asc: 'price ASC',
    price_desc: 'price DESC',
    name: 'name_ru ASC',
  };
  const orderBy = sortMap[sort] || sortMap.id;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRow = db.prepare(`SELECT COUNT(*) as total FROM products ${where}`).get(...params);
  const rows = db
    .prepare(`SELECT * FROM products ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
    .all(...params, limitNum, offset);

  res.json({
    items: rows.map(mapProduct),
    total: countRow.total,
    page: pageNum,
    limit: limitNum,
  });
});

router.post('/', (req, res) => {
  const db = getDb();
  const {
    categoryId,
    nameKk,
    nameRu,
    descriptionKk,
    descriptionRu,
    price,
    region,
    producerName,
    imageUrl,
    badge,
    featured,
  } = req.body;

  if (!categoryId || !nameKk?.trim() || !nameRu?.trim() || !price || !region?.trim() || !producerName?.trim() || !imageUrl?.trim()) {
    return res.status(400).json({ error: 'Заполните все поля и загрузите фото / Барлық өрістер мен сурет міндетті' });
  }

  const result = db
    .prepare(
      `INSERT INTO products (
        category_id, name_kk, name_ru, description_kk, description_ru,
        price, region, producer_name, image_url, badge, in_stock, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`
    )
    .run(
      Number(categoryId),
      nameKk.trim(),
      nameRu.trim(),
      (descriptionKk || '').trim() || nameKk.trim(),
      (descriptionRu || '').trim() || nameRu.trim(),
      Number(price),
      region.trim(),
      producerName.trim(),
      imageUrl.trim(),
      badge?.trim() || null,
      featured ? 1 : 0
    );

  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(mapProduct(row));
});

router.get('/regions', (req, res) => {
  const db = getDb();
  const regions = db
    .prepare('SELECT DISTINCT region FROM products WHERE in_stock = 1 ORDER BY region')
    .all()
    .map((r) => r.region);
  res.json(regions);
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) {
    return res.status(404).json({ error: 'Товар табылмады / Товар не найден' });
  }
  res.json(mapProduct(row));
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Товар не найден / Товар табылмады' });
  }

  const {
    categoryId,
    nameKk,
    nameRu,
    descriptionKk,
    descriptionRu,
    price,
    region,
    producerName,
    imageUrl,
    badge,
    featured,
    inStock,
  } = req.body;

  if (!categoryId || !nameKk?.trim() || !nameRu?.trim() || !price || !region?.trim() || !producerName?.trim()) {
    return res.status(400).json({ error: 'Заполните обязательные поля / Міндетті өрістерді толтырыңыз' });
  }

  const finalImage = imageUrl?.trim() || existing.image_url;

  db.prepare(
    `UPDATE products SET
      category_id = ?, name_kk = ?, name_ru = ?, description_kk = ?, description_ru = ?,
      price = ?, region = ?, producer_name = ?, image_url = ?, badge = ?,
      in_stock = ?, featured = ?
    WHERE id = ?`
  ).run(
    Number(categoryId),
    nameKk.trim(),
    nameRu.trim(),
    (descriptionKk || '').trim() || nameKk.trim(),
    (descriptionRu || '').trim() || nameRu.trim(),
    Number(price),
    region.trim(),
    producerName.trim(),
    finalImage,
    badge?.trim() || null,
    inStock === false || inStock === 0 ? 0 : 1,
    featured ? 1 : 0,
    id
  );

  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.json(mapProduct(row));
});

module.exports = router;
