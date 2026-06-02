const { ensureDb } = require('../server/setup-db');

ensureDb({ reset: true });
console.log('Done. Use npm run db:seed for demo products.');
