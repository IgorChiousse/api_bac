// Import du modèle utilisateur
const authModel = require('../models/auth.model');
// Import du JWT
const jwt = require('jsonwebtoken');

// fonction pour la gestion de role
module.exports.authenticate = async (req, res, next) => {
	try {
		// Définition de la variable pour l'autorisation
		const authHeader = req.header('Authorization');

		// Condition qui vérifie la variable et qui ajoute un Bearer comme execption
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({
				message:
					"Vous devez etre connecté en tant qu'administrateur pour acceder à cette page",
			});
		}
		// Extraction du token sans prefixe 'Bearer'
		const token = authHeader.split(' ')[1];

		// Ajout de la variable pour décoder le token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Déclaration d'une variable qui va récupérer l id de l utilisateur et va lui assigner un token
		const user = await authModel.findById(decoded.user.id);

		// Si il n'y a pas d'utilisateur renvoie un message
		if (!user) {
			return res.status(400).json({ message: 'Utilisateur non trouvé' });
		}
		// Le else n'est pas souhaitable car en local tout fonction mais pas au déployement du au "req.user is not function"
		req.user = user;
		next();
	} catch (error) {
		console.error("Erreur lors de l'authentification", error.message);
		res.status(500).json({ message: 'Erreur lors de lauthentification' });
	}
};
