const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  const categories = db.prepare('SELECT id, slug, name_kk, name_ru FROM categories ORDER BY id').all();
  res.json(categories);
});

module.exports = router;
