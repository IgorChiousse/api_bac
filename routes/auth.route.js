const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/authenticate');
const cloudinaryUpload = require('../middleware/cloudinaryUpload');

// Route pour l'inscription
router.post('/register', cloudinaryUpload, authController.register);

// Route pour la connection
router.post('/login', authController.login);

// Route pour le mot de passe oublié

// Route protégée
router.get('/dashboard', authMiddleware.authenticate, (req, res) => {
	// Vérifier si l'utilisateur est un admin
	if (req.user.role === 'admin') {
		// Définition de req.isAdmin sera égale a true pour les admins
		req.isAdmin = true;
		// Envoyer un réponse de succès
		return res.status(200).json({ message: 'Bienvenue Admin' });
	} else {
		// Envoyer une réponse pour les utilisateurs non admin
		return res.status(403).json({
			message: 'action non autorisée, seul les admins peuvent accéder à cette page',
		});
	}
});

module.exports = router;

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
