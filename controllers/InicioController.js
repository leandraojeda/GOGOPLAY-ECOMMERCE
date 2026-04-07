const ProductService = require('../services/ProductService');
const CategoryService = require('../services/CategoryService');

class InicioController {
    static async index(req, res) {
        try {
            // Obtener productos y categorías de forma asíncrona
            ProductService.getAllProducts((err, products) => {
                if (err) {
                    console.error('Error al obtener productos:', err);
                    return res.status(500).render('error', { 
                        message: 'Error al cargar los productos',
                        error: err 
                    });
                }

                CategoryService.getAllCategories((categoryErr, categories) => {
                    if (categoryErr) {
                        console.error('Error al obtener categorías:', categoryErr);
                        return res.status(500).render('error', { 
                            message: 'Error al cargar las categorías',
                            error: categoryErr 
                        });
                    }

                    // Renderizar la vista de inicio con los datos
                    res.render('inicio/index', {
                        title: 'Mi Tienda de Juguetes',
                        products: products || [],
                        categories: categories || [],
                        //user: req.user Si tienes sistema de autenticación
                    });
                });
            });
        } catch (error) {
            console.error('Error en InicioController:', error);
            res.status(500).render('error', { 
                message: 'Error del servidor',
                error: error 
            });
        }
    }
}

module.exports = InicioController;
