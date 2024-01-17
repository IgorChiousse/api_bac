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

// Route pour avoir un utilisateur par l'id en tant qu'admin
router.get('/user/:id', authMiddleware.authenticate, authController.getUserById);

router.get('/profil/:id', authController.profil);

module.exports = router;
