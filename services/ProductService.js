const ProductRepository = require('../repositories/ProductRepository');

class ProductService {
  // Obtener todos los productos
  static getAllProducts(callback) {
    console.log('ProductService: Iniciando getAllProducts');
    ProductRepository.getAllWithCategories(callback);
  }

  // Obtener un producto por su ID
  static getProductById(id, callback) {
    console.log('ProductService: Buscando producto con ID:', id);
    ProductRepository.getById(id, callback);
  }

  // Crear un nuevo producto
  static createProduct(product, callback) {
    console.log('ProductService: Creando nuevo producto');
    ProductRepository.create(product, callback);
  }

  // Actualizar un producto existente
  static updateProduct(id, product, callback) {
    console.log('ProductService: Actualizando producto con ID:', id);
    ProductRepository.update(id, product, callback);
  }

  // Eliminar un producto por su ID
  static deleteProduct(id, callback) {
    console.log('ProductService: Eliminando producto con ID:', id);
    ProductRepository.delete(id, callback);
  }

  // Obtener productos por categoría
  static getProductsByCategory(categoryId, callback) {
    console.log('ProductService: Buscando productos de categoría:', categoryId);
    ProductRepository.getByCategory(categoryId, callback);
  }

  // Búsqueda de productos
  static searchProducts(searchTerm, callback) {
    console.log('ProductService: Buscando productos con término:', searchTerm);
    ProductRepository.search(searchTerm, callback);
  }

  // Obtener productos con stock bajo
  static getLowStockProducts(threshold = 10, callback) {
    console.log('ProductService: Buscando productos con stock bajo');
    ProductRepository.getLowStock(threshold, callback);
  }

  // Obtener productos destacados
  static getFeaturedProducts(callback) {
    console.log('ProductService: Obteniendo productos destacados');
    ProductRepository.getFeatured(callback);
  }
}

module.exports = ProductService;