const db = require('../models/Cart');

class CartService {
    static getOrCreateCart(userId, session, callback) {
        if (userId) {
            db.get('SELECT * FROM cart WHERE userId = ? AND status = ?', [userId, 'active'], (err, cart) => {
                if (err) return callback(err);
                if (cart) return callback(null, cart);

                db.run(
                    'INSERT INTO cart (userId, status) VALUES (?, ?)',
                    [userId, 'active'],
                    function (err) {
                        if (err) return callback(err);
                        callback(null, { id: this.lastID, userId });
                    }
                );
            });
        } else {
            // Si no hay sesión iniciada, se trabaja con session.cartId
            if (session.cartId) {
                db.get('SELECT * FROM cart WHERE id = ? AND status = ?', [session.cartId, 'active'], (err, cart) => {
                    if (err) return callback(err);
                    if (cart) return callback(null, cart);

                    // Si el carrito no existe, crear uno nuevo
                    db.run(
                        'INSERT INTO cart (userId, status) VALUES (?, ?)',
                        [null, 'active'],
                        function (err) {
                            if (err) return callback(err);
                            session.cartId = this.lastID;
                            callback(null, { id: this.lastID, userId: null });
                        }
                    );
                });
            } else {
                // No hay session.cartId, crear nuevo carrito anónimo
                db.run(
                    'INSERT INTO cart (userId, status) VALUES (?, ?)',
                    [null, 'active'],
                    function (err) {
                        if (err) return callback(err);
                        session.cartId = this.lastID;
                        callback(null, { id: this.lastID, userId: null });
                    }
                );
            }
        }
    }

    static getCartContents(cartId, callback) {
        db.all(`
            SELECT ci.*, p.name, p.thumbnail, p.price as unit_price,
                   (ci.quantity * p.price) as total_price
            FROM cart_item ci
            JOIN product p ON ci.productId = p.id
            WHERE ci.cartId = ?
        `, [cartId], (err, items) => {
            if (err) return callback(err);
            const formatted = items.map(item => ({
                ...item,
                price: parseFloat(item.unit_price),
                totalPrice: parseFloat(item.total_price)
            }));
            callback(null, formatted);
        });
    }

    static getCartTotal(cartId, callback) {
        db.get(`
            SELECT SUM(ci.quantity * p.price) as total
            FROM cart_item ci
            JOIN product p ON ci.productId = p.id
            WHERE ci.cartId = ?
        `, [cartId], (err, result) => {
            if (err) return callback(err);
            callback(null, { total: result ? parseFloat(result.total) : 0 });
        });
    }

    static addToCart(cartId, productId, quantity, callback) {
        db.get(
            'SELECT id, quantity FROM cart_item WHERE cartId = ? AND productId = ?',
            [cartId, productId],
            (err, existing) => {
                if (err) return callback(err);

                if (existing) {
                    const newQuantity = existing.quantity + quantity;
                    db.run(
                        'UPDATE cart_item SET quantity = ? WHERE id = ?',
                        [newQuantity, existing.id],
                        callback
                    );
                } else {
                    db.run(
                        'INSERT INTO cart_item (cartId, productId, quantity) VALUES (?, ?, ?)',
                        [cartId, productId, quantity],
                        callback
                    );
                }
            }
        );
    }

    static updateItemQuantity(itemId, quantity, callback) {
        if (quantity < 1) return callback(new Error('Cantidad inválida'));
        db.run(
            'UPDATE cart_item SET quantity = ? WHERE id = ?',
            [quantity, itemId],
            callback
        );
    }

    static removeFromCart(itemId, callback) {
        db.run('DELETE FROM cart_item WHERE id = ?', [itemId], callback);
    }

    static clearCart(cartId, callback) {
        db.run('DELETE FROM cart_item WHERE cartId = ?', [cartId], callback);
    }
}

module.exports = CartService;
