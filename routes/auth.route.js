const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/authenticate');
const cloudinaryUpload = require('../middleware/cloudinaryUpload');

// Route pour l'inscription
router.post('/register', cloudinaryUpload, authController.register);

// Route pour vérifier l'email
router.get('/verify-email/:token', authController.verifyEmail);

// Route pour envoyer un email de réinitialisation de mot de passe
router.post('/forgot-password', authController.forgotPassword);

// Route pour les réinitialiser le mot de passe
router.put('/update-password/:token', authController.updatePassword);

// Route pour la connection
router.post('/login', authController.login);

// Route pour la modification du profil
router.put('/update/:id', authMiddleware.verifToken, cloudinaryUpload, authController.update);

// Route pour supprimer notre profil
router.delete('/delete/:id', authMiddleware.verifToken, authController.delete);

// Route protégée
router.get('/dashboard', authMiddleware.authenticate, authController.dashboard);

// Route pour accéder a tous les users en tant qu'admin
router.get('/users', authMiddleware.authenticate, authController.getAllUsers);

// Route pour avoir un utilisateur par l'id en tant qu'admin
router.get('/user/:id', authMiddleware.authenticate, authController.getUserById);

// Route pour voir mon profil
router.get('/profile/:id', authMiddleware.verifToken, authController.profile);

// Route pour modifier un profil en tant qu'admin
router.put(
	'/update-user/:id',
	authMiddleware.authenticate,
	cloudinaryUpload,
	authController.updateUser
);

// Route pour supprimer un profil en tant qu'admin
router.delete('/delete-user/:id', authMiddleware.authenticate, authController.deleteUser);

module.exports = router;
