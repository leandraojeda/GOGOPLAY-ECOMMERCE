const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite3');

// Crear tablas para el carrito
db.serialize(() => {
    // Tabla para el carrito
    db.run(`
        CREATE TABLE IF NOT EXISTS cart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'active'
        )
    `);

    // Tabla para los items del carrito
    db.run(`
        CREATE TABLE IF NOT EXISTS cart_item (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cartId INTEGER,
            productId INTEGER,
            quantity INTEGER DEFAULT 1,
            price REAL,
            FOREIGN KEY (cartId) REFERENCES cart (id),
            FOREIGN KEY (productId) REFERENCES product (id)
        )
    `);
    // Nueva tabla para las órdenes
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            cartId INTEGER,
            total REAL,
            shipping_name TEXT,
            shipping_email TEXT,
            shipping_address TEXT,
            shipping_city TEXT,
            shipping_phone TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users (id),
            FOREIGN KEY (cartId) REFERENCES cart (id)
        )
    `);

    // Tabla para los items de la orden (opcional, pero recomendada)
    db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orderId INTEGER,
            productId INTEGER,
            quantity INTEGER,
            price REAL,
            FOREIGN KEY (orderId) REFERENCES orders (id),
            FOREIGN KEY (productId) REFERENCES product (id)
        )
    `);
});

module.exports = db;