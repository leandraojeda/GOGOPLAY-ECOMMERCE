const CartService = require('../services/CartService');

class CartController {
    // Ver carrito
    static async viewCart(req, res, next) {
        try {
            CartService.getOrCreateCart(req.session.user?.id, req.session, (err, cart) => {
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
            CartService.getOrCreateCart(req.session.user?.id, req.session, (err, cart) => {
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

    // Agregar al carrito
    static async addToCart(req, res, next) {
        try {
            const { productId, quantity } = req.body;

            CartService.getOrCreateCart(req.session.user?.id, req.session, (err, cart) => {
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

    // Actualizar cantidad
    static async updateQuantity(req, res, next) {
        try {
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

    // Eliminar del carrito
    static async removeItem(req, res, next) {
        try {
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

    // Vaciar carrito
    static async clearCart(req, res, next) {
        try {
            CartService.getOrCreateCart(req.session.user?.id, req.session, (err, cart) => {
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
