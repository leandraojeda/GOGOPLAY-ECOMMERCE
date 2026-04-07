// services/UserService.js
const UserRepository = require('../repositories/UserRepository');

class UserService {
  static getAllUsers(callback) {
    UserRepository.getAll(callback);
  }

  static getUserById(id, callback) {
    UserRepository.getById(id, callback);
  }

  static createUser(user, callback) {
    UserRepository.create(user, callback);
  }

  static updateUser(id, user, callback) {
    UserRepository.update(id, user, callback);
  }

  static deleteUser(id, callback) {
    UserRepository.delete(id, callback);
  }

  // Agregar el método para validar el usuario
  static validateUser(username, password, callback) {
    UserRepository.validateUser(username, password, callback);
  }
}

module.exports = UserService;
