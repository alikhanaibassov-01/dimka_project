const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'marketplace.db');

if (!fs.existsSync(dbPath)) {
  console.error('Run npm run db:init first');
  process.exit(1);
}

const db = new Database(dbPath);
const seed = fs.readFileSync(path.join(dataDir, 'seed.sql'), 'utf8');
db.exec(seed);
db.close();

console.log('Demo products seeded');
