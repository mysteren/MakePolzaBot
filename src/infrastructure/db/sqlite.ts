import BetterSqlite from "better-sqlite3";
import type { Database } from "better-sqlite3";
import { Config } from "../config/index.js";
import path from "path";
import fs from "fs";

// Создаём директорию для базы данных, если она не существует
const dbDir = path.dirname(Config.DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Инициализируем подключение к базе данных
export const db: Database = new BetterSqlite(Config.DB_PATH);

// Включаем WAL режим для лучшей производительности
db.pragma("journal_mode = WAL");

// Создаём таблицу пользователей
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    options TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);
