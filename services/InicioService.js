const ProductRepository = require('../repositories/ProductRepository');
const CategoryRepository = require('../repositories/CategoryRepository');

class InicioService {
  static getAllProductsWithCategories(callback) {
    ProductRepository.getAll((err, products) => {
      if (err) return callback(err);
      CategoryRepository.getAll((err, categories) => {
        if (err) return callback(err);
        // Aquí puedes asociar productos con categorías si es necesario
        callback(null, { products, categories });
      });
    });
  }
}

module.exports = InicioService;
