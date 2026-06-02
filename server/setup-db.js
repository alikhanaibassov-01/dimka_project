const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'marketplace.db');
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

function ensureDb({ reset = false } = {}) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  if (reset && fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');

  const hasCategories = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='categories'")
    .get();

  if (!hasCategories) {
    const schema = fs.readFileSync(path.join(dataDir, 'schema.sql'), 'utf8');
    const categories = fs.readFileSync(path.join(dataDir, 'categories.sql'), 'utf8');
    db.exec(schema);
    db.exec(categories);
    console.log('Database initialized (empty catalog):', dbPath);
  }

  db.close();
}

module.exports = { ensureDb, DB_PATH: dbPath };
