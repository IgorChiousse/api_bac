const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/authenticate');
const cloudinaryUpload = require('../middleware/cloudinaryUpload');

// Route pour l'inscription
router.post('/register', cloudinaryUpload, authController.register);

// Route pour la connection
router.post('/login', authController.login);

// Route pour la modification du profil
router.put('/update/:id', cloudinaryUpload, authController.update);

// Route pour supprimer un utilisateur
router.delete('/delete/:id', authController.delete);

// Route protégée
router.get('/dashboard', authMiddleware.authenticate, authController.dashboard);

// Route pour accéder a tous les users en tant qu'admin
router.get('/users', authMiddleware.authenticate, authController.getAllUsers);

// Route pour avoir un utilisateur par l'id
router.get('/user/:id', authMiddleware.authenticate, authController.getUserById);

module.exports = router;

// Admin et user
// Route pour ajouter les informations.
// Route pour lire les informations.
// Route pour modifier les informations.
// Route pour supprimer le compte.

// Admin 2
// Route pour voir tous les utilisateurs.
// Route pour modifier un utilisateur.
// Route pour supprimer un utilisateur.
