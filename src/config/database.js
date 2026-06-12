const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS sites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            webhook_url TEXT,
            status TEXT DEFAULT 'PENDING',
            last_checked TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            site_id INTEGER,
            status TEXT,
            response_time INTEGER,
            checked_at TEXT,
            FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
        )
    `);
});

module.exports = db;