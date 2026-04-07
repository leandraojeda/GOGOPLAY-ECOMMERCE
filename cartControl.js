const CartService = require('../services/CartService');

class CartController {
    // Ver carrito (acceso sin login permitido)
    static async viewCart(req, res, next) {
        try {
            const userId = req.session.user ? req.session.user.id : null;

            CartService.getOrCreateCart(userId, (err, cart) => {
                if (err) return next(err);

                CartService.getCartContents(cart.id, (err, items) => {
                    if (err) return next(err);

                    CartService.getCartTotal(cart.id, (err, total) => {
                        if (err) return next(err);

                        res.render('cart/view', {
                            title: 'Carrito de Compras',
                            items: items || [],
                            total: total ? total.total : 0,
                            cartItemCount: items ? items.length : 0
                        });
                    });
                });
            });
        } catch (error) {
            next(error);
        }
    }

    // Middleware para contar items del carrito
    static async getCartItemCount(req, res, next) {
        try {
            const userId = req.session.user ? req.session.user.id : null;
            if (!userId) {
                res.locals.cartItemCount = 0;
                return next();
            }

            CartService.getOrCreateCart(userId, (err, cart) => {
                if (err) return next(err);

                CartService.getCartContents(cart.id, (err, items) => {
                    if (err) return next(err);
                    res.locals.cartItemCount = items ? items.length : 0;
                    next();
                });
            });
        } catch (error) {
            next(error);
        }
    }

    // Agregar al carrito (sin login requerido)
    static async addToCart(req, res, next) {
        try {
            const userId = req.session.user ? req.session.user.id : null;
            const { productId, quantity } = req.body;

            CartService.getOrCreateCart(userId, (err, cart) => {
                if (err) return next(err);

                CartService.addToCart(cart.id, productId, quantity, (err) => {
                    if (err) return next(err);

                    res.json({
                        success: true,
                        message: 'Producto agregado al carrito'
                    });
                });
            });
        } catch (error) {
            next(error);
        }
    }

    // Actualizar cantidad (requiere login)
    static async updateQuantity(req, res, next) {
        try {
            if (!req.session || !req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Debe iniciar sesión para actualizar el carrito'
                });
            }

            const { itemId, quantity } = req.body;

            CartService.updateItemQuantity(itemId, quantity, (err) => {
                if (err) return next(err);

                res.json({
                    success: true,
                    message: 'Cantidad actualizada'
                });
            });
        } catch (error) {
            next(error);
        }
    }

    // Eliminar del carrito (requiere login)
    static async removeItem(req, res, next) {
        try {
            if (!req.session || !req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Debe iniciar sesión para eliminar items del carrito'
                });
            }
            const { itemId } = req.params;

            CartService.removeFromCart(itemId, (err) => {
                if (err) return next(err);

                res.json({
                    success: true,
                    message: 'Item eliminado del carrito'
                });
            });
        } catch (error) {
            next(error);
        }
    }

    // Vaciar carrito (requiere login)
    static async clearCart(req, res, next) {
        try {
            if (!req.session || !req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Debe iniciar sesión para vaciar el carrito'
                });
            }

            const userId = req.session.user.id;

            CartService.getOrCreateCart(userId, (err, cart) => {
                if (err) return next(err);

                CartService.clearCart(cart.id, (err) => {
                    if (err) return next(err);

                    res.json({
                        success: true,
                        message: 'Carrito vaciado'
                    });
                });
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = { CartController };
