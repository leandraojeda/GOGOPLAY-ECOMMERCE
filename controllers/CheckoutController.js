// controllers/CheckoutController.js
const CartService = require('../services/CartService');
const db = require('../models/Cart'); // Para manejar transacciones

class CheckoutController {
    // Mostrar página de checkout
    static async viewCheckout(req, res, next) {
        try {
            const userId = req.session.user.id; // Usando el ID del usuario de la sesión
            
            CartService.getOrCreateCart(userId, (err, cart) => {
                if (err) return next(err);
                
                CartService.getCartContents(cart.id, (err, items) => {
                    if (err) return next(err);
                    
                    if (!items || items.length === 0) {
                        return res.redirect('/cart');
                    }
                    
                    CartService.getCartTotal(cart.id, (err, total) => {
                        if (err) return next(err);
                        
                        res.render('checkout', {
                            title: 'Finalizar Compra',
                            items: items,
                            total: total ? total.total : 0,
                            cartId: cart.id,
                            user: req.session.user
                        });
                    });
                });
            });
        } catch (error) {
            next(error);
        }
    }

    // Procesar el pago
    static async processPayment(req, res, next) {
        try {
            const userId = req.session.user.id;
            const { shippingInfo } = req.body;

            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                CartService.getOrCreateCart(userId, (err, cart) => {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({
                            success: false,
                            message: 'Error al procesar el pago'
                        });
                    }

                    CartService.getCartContents(cart.id, (err, items) => {
                        if (err || !items || items.length === 0) {
                            db.run('ROLLBACK');
                            return res.status(400).json({
                                success: false,
                                message: 'Carrito vacío'
                            });
                        }

                        CartService.getCartTotal(cart.id, (err, total) => {
                            if (err) {
                                db.run('ROLLBACK');
                                return res.status(500).json({
                                    success: false,
                                    message: 'Error al calcular el total'
                                });
                            }

                            // Crear la orden
                            const createOrder = `
                                INSERT INTO orders (
                                    userId, 
                                    cartId,
                                    total,
                                    shipping_name,
                                    shipping_email,
                                    shipping_address,
                                    shipping_city,
                                    shipping_phone,
                                    status,
                                    created_at
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                            `;

                            db.run(createOrder, [
                                userId,
                                cart.id,
                                total.total,
                                shippingInfo.name,
                                shippingInfo.email,
                                shippingInfo.address,
                                shippingInfo.city,
                                shippingInfo.phone,
                                'completed'
                            ], function(err) {
                                if (err) {
                                    db.run('ROLLBACK');
                                    return res.status(500).json({
                                        success: false,
                                        message: 'Error al crear la orden'
                                    });
                                }

                                const orderId = this.lastID;

                                // Actualizar estado del carrito
                                db.run(
                                    'UPDATE cart SET status = ? WHERE id = ?',
                                    ['completed', cart.id],
                                    (err) => {
                                        if (err) {
                                            db.run('ROLLBACK');
                                            return res.status(500).json({
                                                success: false,
                                                message: 'Error al actualizar el carrito'
                                            });
                                        }

                                        // Crear nuevo carrito activo
                                        db.run(
                                            'INSERT INTO cart (userId, status) VALUES (?, ?)',
                                            [userId, 'active'],
                                            (err) => {
                                                if (err) {
                                                    db.run('ROLLBACK');
                                                    return res.status(500).json({
                                                        success: false,
                                                        message: 'Error al crear nuevo carrito'
                                                    });
                                                }

                                                // Completar la transacción
                                                db.run('COMMIT', (err) => {
                                                    if (err) {
                                                        db.run('ROLLBACK');
                                                        return res.status(500).json({
                                                            success: false,
                                                            message: 'Error al finalizar la transacción'
                                                        });
                                                    }

                                                    res.json({
                                                        success: true,
                                                        message: 'Pago procesado exitosamente',
                                                        orderId: orderId
                                                    });
                                                });
                                            }
                                        );
                                    }
                                );
                            });
                        });
                    });
                });
            });
        } catch (error) {
            next(error);
        }
    }

    // Ver confirmación de orden
    static async viewOrderConfirmation(req, res, next) {
        try {
            const { orderId } = req.params;
            
            db.get(
                `SELECT o.*, 
                        u.username,
                        c.status as cart_status
                 FROM orders o
                 JOIN users u ON o.userId = u.id
                 JOIN cart c ON o.cartId = c.id
                 WHERE o.id = ? AND o.userId = ?`,
                [orderId, req.session.user.id],
                (err, order) => {
                    if (err) return next(err);
                    
                    if (!order) {
                        return res.status(404).render('error', {
                            message: 'Orden no encontrada'
                        });
                    }

                    res.render('order-confirmation', {
                        title: 'Confirmación de Orden',
                        order: order,
                        user: req.session.user
                    });
                }
            );
        } catch (error) {
            next(error);
        }
    }
}

module.exports = { CheckoutController };