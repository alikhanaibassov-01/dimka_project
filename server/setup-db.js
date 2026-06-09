const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'marketplace.db');
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

function tableExists(db, name) {
  return !!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(name);
}

function columnExists(db, table, column) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  return cols.some((c) => c.name === column);
}

function migrate(db) {
  if (!tableExists(db, 'users')) {
    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
  }

  if (tableExists(db, 'categories') && !columnExists(db, 'categories', 'name_en')) {
    db.exec(`ALTER TABLE categories ADD COLUMN name_en TEXT NOT NULL DEFAULT ''`);
    db.prepare(`UPDATE categories SET name_en = name_ru WHERE name_en = ''`).run();
  }

  if (tableExists(db, 'products')) {
    if (!columnExists(db, 'products', 'name_en')) {
      db.exec(`ALTER TABLE products ADD COLUMN name_en TEXT NOT NULL DEFAULT ''`);
    }
    if (!columnExists(db, 'products', 'description_en')) {
      db.exec(`ALTER TABLE products ADD COLUMN description_en TEXT NOT NULL DEFAULT ''`);
    }
    if (!columnExists(db, 'products', 'deleted')) {
      db.exec(`ALTER TABLE products ADD COLUMN deleted INTEGER NOT NULL DEFAULT 0`);
    }
  }

  if (tableExists(db, 'orders')) {
    if (!columnExists(db, 'orders', 'user_id')) {
      db.exec(`ALTER TABLE orders ADD COLUMN user_id INTEGER REFERENCES users(id)`);
    }
    if (!columnExists(db, 'orders', 'payment_method')) {
      db.exec(`ALTER TABLE orders ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'cod'`);
    }
    if (!columnExists(db, 'orders', 'payment_status')) {
      db.exec(`ALTER TABLE orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending'`);
    }
  }
}

function seedAdmin(db) {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@qazmarket.kz').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = bcrypt.hashSync(adminPassword, 10);
  const existing = db.prepare(`SELECT id FROM users WHERE email = ?`).get(adminEmail);

  if (existing) {
    db.prepare(`UPDATE users SET password_hash = ?, role = 'admin' WHERE id = ?`).run(hash, existing.id);
    return;
  }

  db.prepare(
    `INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, 'admin')`
  ).run(adminEmail, hash, 'Administrator');
  console.log('Default admin created:', adminEmail);
}

function ensureDb({ reset = false } = {}) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  if (reset && fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');

  const hasCategories = tableExists(db, 'categories');

  if (!hasCategories) {
    const schema = fs.readFileSync(path.join(dataDir, 'schema.sql'), 'utf8');
    const categories = fs.readFileSync(path.join(dataDir, 'categories.sql'), 'utf8');
    db.exec(schema);
    db.exec(categories);
    console.log('Database initialized (empty catalog):', dbPath);
  } else {
    migrate(db);
  }

  seedAdmin(db);
  db.close();
}

module.exports = { ensureDb, DB_PATH: dbPath };
