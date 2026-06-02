const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'marketplace.db');
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(path.join(dataDir, 'schema.sql'), 'utf8');
const categories = fs.readFileSync(path.join(dataDir, 'categories.sql'), 'utf8');

db.exec(schema);
db.exec(categories);
db.close();

console.log('Database initialized (empty catalog):', dbPath);
