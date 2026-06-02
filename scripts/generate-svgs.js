const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'assets', 'products');
const colors = {
  food: ['#00AFCA', '#FEC50C'],
  textile: ['#7c3aed', '#c4b5fd'],
  honey: ['#d97706', '#fde68a'],
  craft: ['#059669', '#a7f3d0'],
};

const files = [
  'food-1', 'food-2', 'food-3', 'food-4', 'food-5', 'food-6',
  'textile-1', 'textile-2', 'textile-3', 'textile-4', 'textile-5',
  'honey-1', 'honey-2', 'honey-3', 'honey-4',
  'craft-1', 'craft-2', 'craft-3', 'craft-4', 'craft-5',
];

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

files.forEach((name) => {
  const type = name.split('-')[0];
  const [c1, c2] = colors[type] || colors.food;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs>
  <rect width="200" height="200" rx="24" fill="url(#g)" opacity="0.15"/>
  <circle cx="100" cy="90" r="40" fill="${c1}" opacity="0.35"/>
  <rect x="60" y="130" width="80" height="12" rx="6" fill="${c2}" opacity="0.6"/>
  <text x="100" y="175" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="${c1}" font-weight="600">QAZ</text>
</svg>`;
  fs.writeFileSync(path.join(dir, `${name}.svg`), svg);
});

console.log('Generated', files.length, 'SVGs');
