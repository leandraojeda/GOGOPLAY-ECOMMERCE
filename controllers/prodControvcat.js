const multer = require('multer');
const ProductService = require('../services/ProductService');
const CategoryService = require('../services/CategoryService');

// Configuración de multer para las imágenes de productos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const upload = multer({ storage: storage }).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 }
]);

class ProductController {
  // Listar productos
  static index(req, res) {
    ProductService.getAllProducts((err, products) => {
      if (err) {
        console.error('Error al obtener productos:', err);
        return res.status(500).render('error', { error: err });
      }
      res.render('products/index', { products });
    });
  }

  // Mostrar formulario de creación
  static create(req, res) {
    CategoryService.getAllCategories((err, categories) => {
      if (err) {
        console.error('Error al obtener categorías:', err);
        return res.status(500).render('error', { error: err });
      }
      res.render('products/create', { 
        categories: categories || [],
        product: {},
        errors: []
      });
    });
  }

  // Almacenar nuevo producto
  static store(req, res) {
    const product = {
      code: req.body.code,
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      categoryId: req.body.categoryId,
      thumbnail: req.files?.thumbnail ? `/uploads/${req.files.thumbnail[0].filename}` : null,
      image1: req.files?.image1 ? `/uploads/${req.files.image1[0].filename}` : null,
      image2: req.files?.image2 ? `/uploads/${req.files.image2[0].filename}` : null,
      updatedAt: new Date()
    };

    ProductService.createProduct(product, (err) => {
      if (err) {
        console.error('Error al crear producto:', err);
        CategoryService.getAllCategories((categoryErr, categories) => {
          return res.render('products/create', {
            categories: categories || [],
            product: req.body,
            errors: [err.message]
          });
        });
      } else {
        res.redirect('/products');
      }
    });
  }

  // Mostrar detalles de producto
  static show(req, res) {
    const id = req.params.id;
    ProductService.getProductById(id, (err, product) => {
      if (err) {
        console.error('Error al obtener producto:', err);
        return res.status(500).render('error', { error: err });
      }
      res.render('products/show', { product });
    });
  }

  // Mostrar formulario de edición
  static edit(req, res) {
    const id = req.params.id;
    
    // Obtener producto y categorías
    ProductService.getProductById(id, (err, product) => {
      if (err) return res.status(500).render('error', { error: 'Error al obtener el producto' });
      
      CategoryService.getAllCategories((categoryErr, categories) => {
        if (categoryErr) return res.status(500).render('error', { error: 'Error al obtener categorías' });
        
        res.render('products/edit', { 
          product,
          categories: categories || [],
          errors: []
        });
      });
    });
  }

  // Actualizar producto
  static update(req, res) {
    const id = req.params.id;
    const updatedProduct = {
      code: req.body.code,
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      categoryId: req.body.categoryId,
      thumbnail: req.files?.thumbnail ? `/uploads/${req.files.thumbnail[0].filename}` : req.body.oldThumbnail,
      image1: req.files?.image1 ? `/uploads/${req.files.image1[0].filename}` : req.body.oldImage1,
      image2: req.files?.image2 ? `/uploads/${req.files.image2[0].filename}` : req.body.oldImage2,
      updatedAt: new Date()
    };

    ProductService.updateProduct(id, updatedProduct, (err) => {
      if (err) {
        console.error('Error al actualizar producto:', err);
        return CategoryService.getAllCategories((categoryErr, categories) => {
          res.render('products/edit', {
            product: { ...updatedProduct, id },
            categories: categories || [],
            errors: [err.message]
          });
        });
      }
      res.redirect('/products');
    });
  }

  // Eliminar producto
  static delete(req, res) {
    const id = req.params.id;
    ProductService.deleteProduct(id, (err) => {
      if (err) {
        console.error('Error al eliminar producto:', err);
        return res.status(500).render('error', { error: err });
      }
      res.redirect('/products');
    });
  }
}

module.exports = { ProductController, upload };