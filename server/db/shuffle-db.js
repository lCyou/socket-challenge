import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function shuffleArray(array) {
  return array
    .map((v) => [Math.random(), v])
    .sort((a, b) => a[0] - b[0])
    .map((v) => v[1]);
}

function shuffleJsonColumns(json) {
  const result = {};
  for (const key in json) {
    if (Array.isArray(json[key])) {
      result[key] = shuffleArray(json[key]);
    } else {
      result[key] = json[key];
    }
  }
  return result;
}

// ESモジュールで__dirnameを使うための対応
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
db.items = shuffleJsonColumns(db.items);
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('db.json shuffled!');