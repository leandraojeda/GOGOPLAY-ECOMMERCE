// repositories/UserRepository.js
const db = require('../models/User');

class UserRepository {
  static getAll(callback) {
    db.all('SELECT * FROM users', callback);
  }

  static getById(id, callback) {
    db.get('SELECT * FROM users WHERE id = ?', [id], callback);
  }

  static create(user, callback) {
    const { name, username, password, email, imagen, rol, updatedAt } = user;
    db.run(
      'INSERT INTO users (name, username, password, email, imagen, rol, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, username, password, email, imagen, rol, updatedAt],
      callback
    );
  }

  static update(id, user, callback) {
    const { name, username, password, email, imagen, rol, updatedAt } = user;
    db.run(
      'UPDATE users SET name = ?, username = ?, password = ?, email = ?, imagen = ?, rol = ?, updatedAt = ? WHERE id = ?',
      [name, username, password, email, imagen, rol, updatedAt, id],
      callback
    );
  }

  static delete(id, callback) {
    db.run('DELETE FROM users WHERE id = ?', [id], callback);
  }

  // Método para validar el usuario
  static validateUser(username, password, callback) {
    db.get(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password],
      (err, user) => {
        if (err) {
          return callback(err, null);
        }
        // Si se encuentra un usuario, lo devolvemos; si no, null
        return callback(null, user || null);
      }
    );
  }
}

module.exports = UserRepository;
