"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
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
        }
        else {
            result[key] = json[key];
        }
    }
    return result;
}
// ESモジュールで__dirnameを使うための対応
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
const dbPath = path_1.default.join(__dirname, 'db.json');
const db = JSON.parse(fs_1.default.readFileSync(dbPath, 'utf8'));
db.items = shuffleJsonColumns(db.items);
fs_1.default.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('db.json shuffled!');
