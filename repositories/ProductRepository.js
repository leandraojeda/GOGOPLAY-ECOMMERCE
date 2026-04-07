const db = require('../models/Product');

class ProductRepository {
  // Obtener todos los productos
  static getAll(callback) {
    db.all('SELECT * FROM product', callback);
  }

  // Obtener un producto por su ID
  static getById(id, callback) {
    db.get('SELECT * FROM product WHERE id = ?', [id], callback);
  }

  // Crear un nuevo producto
  static create(product, callback) {
    const { code, name, price, stock, description, updatedAt, thumbnail, image1, image2, categoryId } = product;
    db.run(
      'INSERT INTO product (code, name, price, stock, description, updatedAt, thumbnail, image1, image2, categoryId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [code, name, price, stock, description, updatedAt, thumbnail, image1, image2, categoryId],
      callback
    );
  }

  // Actualizar un producto existente
  static update(id, product, callback) {
    const { code, name, price, stock, description, updatedAt, thumbnail, image1, image2, categoryId } = product;
    db.run(
      'UPDATE product SET code = ?, name = ?, price = ?, stock = ?, description = ?, updatedAt = ?, thumbnail = ?, image1 = ?, image2 = ?, categoryId = ? WHERE id = ?',
      [code, name, price, stock, description, updatedAt, thumbnail, image1, image2, categoryId, id],
      callback
    );
  }

  // Eliminar un producto por su ID
  static delete(id, callback) {
    db.run('DELETE FROM product WHERE id = ?', [id], callback);
  }

  // Obtener productos por categoría
  static getByCategory(categoryId, callback) {
    const query = 'SELECT * FROM product WHERE categoryId = ?';
    db.all(query, [categoryId], callback);
  }
  // Búsqueda de productos
  static search(searchTerm, callback) {
    const query = `
      SELECT * FROM product 
      WHERE name LIKE ? 
      OR description LIKE ? 
      OR code LIKE ?
    `;
    const searchPattern = `%${searchTerm}%`;
    db.all(query, [searchPattern, searchPattern, searchPattern], callback);
  }
    // Obtener productos con stock bajo
  static getLowStock(threshold, callback) {
    const query = 'SELECT * FROM product WHERE stock <= ?';
    db.all(query, [threshold], callback);
  }
  // Obtener productos destacados
  static getFeatured(callback) {
    const query = 'SELECT * FROM product LIMIT 8'; // Por ejemplo, los primeros 8 productos
    db.all(query, callback);
  }
  // Obtener producto con información de categoría
  static getByIdWithCategory(id, callback) {
    const query = `
      SELECT p.*, c.name as categoryName 
      FROM product p 
      LEFT JOIN category c ON p.categoryId = c.id 
      WHERE p.id = ?
    `;
    db.get(query, [id], callback);
  }
  // Obtener todos los productos con información de categoría
  static getAllWithCategories(callback) {
    const query = `
      SELECT p.*, c.name as categoryName 
      FROM product p 
      LEFT JOIN category c ON p.categoryId = c.id
    `;
    db.all(query, callback);
  }

}

module.exports = ProductRepository;
