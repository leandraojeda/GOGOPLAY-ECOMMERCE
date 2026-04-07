const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite3');

// Crear la tabla si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS product (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT,
      name TEXT,
      price REAL,
      stock INTEGER,
      description TEXT,
      updatedAt DATETIME,
      thumbnail TEXT,
      image1 TEXT,
      image2 TEXT,
      categoryId INTEGER,
      FOREIGN KEY (categoryId) REFERENCES category (id)
    )
  `);
});

module.exports = db;
