const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/authenticate');
const cloudinaryUpload = require('../middleware/cloudinaryUpload');

// Admin
// Route pour ajouter les informations.
// Route pour lire les informations.
// Route pour modifier les informations.
// Route pour supprimer le compte.

// Admin 2
// Route pour voir tous les utilisateurs.
// Route pour modifier un utilisateur.
// Route pour supprimer un utilisateur.

// User
// Route pour ajouter les informations.
// Route pour lire les informations.
// Route pour modifier les informations.
// Route pour supprimer le compte.

module.exports = router;
