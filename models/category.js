const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite3');

// Crear la tabla 'category' si no existe
db.serialize(() => { 
  db.run(`
    CREATE TABLE IF NOT EXISTS category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      image TEXT,
      updateAt DATETIME
    )
  `);
});

module.exports = db;
