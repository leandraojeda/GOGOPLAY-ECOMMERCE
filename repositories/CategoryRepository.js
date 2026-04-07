const db = require('../models/category');

class CategoryRepository {
  // Obtener todas las categorías
  static getAll(callback) {
    console.log('CategoryRepository: Iniciando getAll');
    db.all('SELECT * FROM category', callback);
  }

  // Obtener una categoría por su ID
  static getById(id, callback) {
    db.get('SELECT * FROM category WHERE id = ?', [id], callback);
  }

  // Crear una nueva categoría
  static create(category, callback) {
    const { name, description, image, updateAt } = category;
    db.run(
      'INSERT INTO category (name, description, image, updateAt) VALUES (?, ?, ?, ?)',
      [name, description, image, updateAt],
      callback
    );
  }

  // Actualizar una categoría existente
  static update(id, category, callback) {
    const { name, description, image, updateAt } = category;
    db.run(
      'UPDATE category SET name = ?, description = ?, image = ?, updateAt = ? WHERE id = ?',
      [name, description, image, updateAt, id],
      callback
    );
  }

  // Eliminar una categoría por su ID
  static delete(id, callback) {
    db.run('DELETE FROM category WHERE id = ?', [id], callback);
  }
}

module.exports = CategoryRepository;
