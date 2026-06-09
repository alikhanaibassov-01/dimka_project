const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function mapUser(row) {
  const firstName = row.first_name || '';
  const lastName = row.last_name || '';
  const name = [lastName, firstName].filter(Boolean).join(' ') || row.name || '';
  return {
    id: row.id,
    email: row.email,
    name,
    firstName,
    lastName,
    phone: row.phone || '',
    role: row.role,
  };
}

function validatePhone(phone) {
  if (!phone?.trim()) return true;
  const cleaned = phone.replace(/\s/g, '');
  return /^\+?7?\d{10,11}$/.test(cleaned) || /^8\d{10}$/.test(cleaned);
}

router.post('/register', (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
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
      .prepare(
        `INSERT INTO users (email, password_hash, name, first_name, last_name, phone, role)
         VALUES (?, ?, ?, '', '', '', 'client')`
      )
      .run(normalized, hash, normalized.split('@')[0]);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
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
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  if (!user) {
    req.session.destroy(() => {});
    return res.json(null);
  }
  res.json(mapUser(user));
});

router.patch('/profile', requireAuth, (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;
    if (!firstName?.trim() || !lastName?.trim() || !phone?.trim()) {
      return res.status(400).json({ error: 'Заполните фамилию, имя и телефон / Толық толтырыңыз' });
    }
    if (!validatePhone(phone)) {
      return res.status(400).json({ error: 'Некорректный номер телефона / Телефон дұрыс емес' });
    }

    const db = getDb();
    const fullName = `${lastName.trim()} ${firstName.trim()}`;
    db.prepare(
      `UPDATE users SET first_name = ?, last_name = ?, phone = ?, name = ? WHERE id = ? AND role = 'client'`
    ).run(firstName.trim(), lastName.trim(), phone.trim(), fullName, req.session.userId);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(mapUser(user));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
