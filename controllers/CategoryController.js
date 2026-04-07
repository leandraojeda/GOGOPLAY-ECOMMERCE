const multer = require('multer');
const CategoryService = require('../services/CategoryService');

// Configuración de multer para manejar las subidas de archivos de imagen de categoría
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Carpeta donde se guardarán las imágenes subidas
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const upload = multer({ storage: storage });

class CategoryController {
  // Muestra todas las categorías
  static index(req, res) {
    CategoryService.getAllCategories((err, categories) => {
      console.log('CategoryRepository: estoy en categoria');
      if (err) throw err;
      res.render('categories/index', { categories });
    });
  }

  // Muestra el formulario para crear una nueva categoría
  static create(req, res) {
    res.render('categories/create');
  }

  // Almacena la nueva categoría
  static store(req, res) {
    const category = {
      name: req.body.name,
      description: req.body.description,
      //...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : null, // Se maneja la imagen subida
      updateAt: new Date()
    };
    CategoryService.createCategory(category, (err) => {
      if (err) throw err;
      res.redirect('/categories');
    });
  }

  // Muestra los detalles de una categoría específica
  static show(req, res) {
    const id = req.params.id;
    CategoryService.getCategoryById(id, (err, category) => {
      if (err) throw err;
      res.render('categories/show', { category });
    });
  }

  // Muestra el formulario para editar una categoría específica
  /*static edit(req, res) {
    const id = req.params.id;
    CategoryService.getCategoryById(id, (err, category) => {
      if (err) throw err;
      res.render('categories/edit', { category });
    });
  }

  // Actualiza los datos de una categoría específica
  static update(req, res) {
    const id = req.params.id;
    const category = {
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : req.body.oldImage, // Si hay nueva imagen, reemplaza la anterior
      updateAt: new Date()
    };
    CategoryService.updateCategory(id, category, (err) => {
      if (err) throw err;
      res.redirect(`/categories/${id}`);
    });
  }*/

  static edit(req, res) {
    const id = req.params.id;
    CategoryService.getCategoryById(id, (err, category) => {
      if (err) return res.status(500).send('Error al obtener la categoría1111');
      res.render('categories/edit', { category }); // Renderiza la vista de edición
    });
  }

  static update(req, res) {
    const id = req.params.id;
    const category = {
      name: req.body.name,
      //...req.body,
      description: req.body.description,
      image: req.file ? `/uploads/${req.file.filename}` : req.body.oldImage,
      updatedAt: new Date()
    };

    CategoryService.updateCategory(id, category, (err) => {
      if (err) return res.status(500).send('Error al actualizar la categorí22222a');
      res.redirect(`/categories/${id}`); // Redirige a la lista de categorías
    });
  }

  // Elimina una categoría específica
  static delete(req, res) {
    const id = req.params.id;
    CategoryService.deleteCategory(id, (err) => {
      if (err) throw err;
      res.redirect('/categories');
    });
  }
}

module.exports = { CategoryController, upload };
