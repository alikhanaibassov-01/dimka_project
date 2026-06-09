const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db');

const router = express.Router();

function mapUser(row) {
  return { id: row.id, email: row.email, name: row.name, role: row.role };
}

router.post('/register', (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email?.trim() || !password || !name?.trim()) {
      return res.status(400).json({ error: 'Заполните все поля / Барлық өрістерді толтырыңыз' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль минимум 6 символов / Құпия сөз кемінде 6 таңба' });
    }

    const db = getDb();
    const normalized = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalized);
    if (existing) {
      return res.status(409).json({ error: 'Email уже занят / Email бос емес' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const result = db
      .prepare(`INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, 'client')`)
      .run(normalized, hash, name.trim());

    const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(result.lastInsertRowid);
    req.session.userId = user.id;
    req.session.role = user.role;
    res.status(201).json(mapUser(user));
  } catch (err) {
    next(err);
  }
});

router.post('/login', (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Неверный email или пароль / Email немесе құпия сөз қате' });
    }

    req.session.userId = user.id;
    req.session.role = user.role;
    res.json(mapUser(user));
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  if (!req.session?.userId) {
    return res.json(null);
  }
  const db = getDb();
  const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(req.session.userId);
  if (!user) {
    req.session.destroy(() => {});
    return res.json(null);
  }
  res.json(mapUser(user));
});

module.exports = router;
