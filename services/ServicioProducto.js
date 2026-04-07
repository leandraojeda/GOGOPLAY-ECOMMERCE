// services/ProductService.js
const ProductRepository = require('../repositories/ProductRepository');

class ProductService {
  // Obtener todos los productos
  static getAllProducts() {
    return new Promise((resolve, reject) => {
      ProductRepository.getAll((err, products) => {
        if (err) reject(err);
        else resolve(products);
      });
    });
  }

  // Obtener un producto por su ID
  static getProductById(id) {
    return new Promise((resolve, reject) => {
      ProductRepository.getById(id, (err, product) => {
        if (err) reject(err);
        else resolve(product);
      });
    });
  }

  // Crear un nuevo producto
  static createProduct(product) {
    return new Promise((resolve, reject) => {
      ProductRepository.create(product, (err, newProduct) => {
        if (err) reject(err);
        else resolve(newProduct);
      });
    });
  }

  // Actualizar un producto existente
  static updateProduct(id, product) {
    return new Promise((resolve, reject) => {
      ProductRepository.update(id, product, (err, updatedProduct) => {
        if (err) reject(err);
        else resolve(updatedProduct);
      });
    });
  }

  // Eliminar un producto por su ID
  static deleteProduct(id) {
    return new Promise((resolve, reject) => {
      ProductRepository.delete(id, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  // Obtener productos por categoría
  static getProductsByCategory(categoryId) {
    return new Promise((resolve, reject) => {
      ProductRepository.getByCategory(categoryId, (err, products) => {
        if (err) reject(err);
        else resolve(products);
      });
    });
  }

  // Búsqueda de productos
  static searchProducts(searchTerm) {
    return new Promise((resolve, reject) => {
      ProductRepository.search(searchTerm, (err, products) => {
        if (err) reject(err);
        else resolve(products);
      });
    });
  }

  // Obtener productos con stock bajo
  static getLowStockProducts(threshold = 10) {
    return new Promise((resolve, reject) => {
      ProductRepository.getLowStock(threshold, (err, products) => {
        if (err) reject(err);
        else resolve(products);
      });
    });
  }

  // Obtener productos destacados
  static getFeaturedProducts() {
    return new Promise((resolve, reject) => {
      ProductRepository.getFeatured((err, products) => {
        if (err) reject(err);
        else resolve(products);
      });
    });
  }
}

module.exports = ProductService;