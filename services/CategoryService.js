const CategoryRepository = require('../repositories/CategoryRepository');

class CategoryService {
  // Obtener todas las categorías
  static getAllCategories(callback) {
    console.log('CategoryService: Obteniendo todas las categorías');
    CategoryRepository.getAll((err, categories) => {
        if (err) {
            console.error('Error en CategoryService.getAllCategories:', err);
            return callback(err);
        }
        callback(null, categories || []);
    });
}

  // Obtener una categoría por su ID
  static getCategoryById(id, callback) {
    CategoryRepository.getById(id, callback);
  }

  // Crear una nueva categoría
  static createCategory(category, callback) {
    CategoryRepository.create(category, callback);
  }

  // Actualizar una categoría existente
  static updateCategory(id, category, callback) {
    CategoryRepository.update(id, category, callback);
  }

  // Eliminar una categoría por su ID
  static deleteCategory(id, callback) {
    CategoryRepository.delete(id, callback);
  }
}

module.exports = CategoryService;
