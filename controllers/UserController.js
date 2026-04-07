const multer = require('multer');
const UserService = require('../services/UserService');

// Configuración de multer para manejar las subidas de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos subidos
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const upload = multer({ storage: storage });

class UserController {
  static index(req, res) {
    UserService.getAllUsers((err, users) => {
      if (err) throw err;
      res.render('users/index', { users });
    });
  }

  static create(req, res) {
    res.render('users/create');
  }

  static store(req, res) {
    const user = {
      ...req.body,
      imagen: req.file ? `/uploads/${req.file.filename}` : null, // Se maneja la imagen subida
      updatedAt: new Date()
    };
    UserService.createUser(user, (err) => {
      if (err) throw err;
      res.redirect('/users');
    });
  }

  static show(req, res) {
    const id = req.params.id;
    UserService.getUserById(id, (err, user) => {
      if (err) throw err;
      res.render('users/show', { user });
    });
  }

  static edit(req, res) {
    const id = req.params.id;
    UserService.getUserById(id, (err, user) => {
      if (err) throw err;
      res.render('users/edit', { user });
    });
  }

  static update(req, res) {
    const id = req.params.id;
    const user = {
      ...req.body,
      imagen: req.file ? `/uploads/${req.file.filename}` : req.body.oldImagen,
      updatedAt: new Date()
    };
    UserService.updateUser(id, user, (err) => {
      if (err) throw err;
      res.redirect(`/users/${id}`);
    });
  }

  static delete(req, res) {
    const id = req.params.id;
    UserService.deleteUser(id, (err) => {
      if (err) throw err;
      res.redirect('/users');
    });
  }
}

module.exports = { UserController, upload };
