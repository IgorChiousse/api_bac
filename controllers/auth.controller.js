// Import du model utilisateur
const authModel = require('../models/auth.model');

// Import de la validation des données
const { validationResult } = require('express-validator');

// Import du model hachage bcrypt
const bcrypt = require('bcryptjs');

// Import du model jwt pour les tokens
const jwt = require('jsonwebtoken');

// Import du module validator pour email
const validator = require('validator');

// fonction pour l inscription
module.exports.register = async (req, res) => {
	// Validation des données d'entrée
	try {
		// Récupération des erreurs de validation
		const errors = validationResult(req);
		// Vérification si il y a des erreurs de validation
		if (!errors.isEmpty()) {
			// Renvoie des erreurs de validation
			return res.status(400).json({ errors: errors.array() });
		}
		// Récupération des données du formulaire
		const { email, password } = req.body;

		// Vérification de la longueur du mot de passe avec une condition
		if (password.length < 6) {
			// Vérification de la longueur du mot de passe (6carractere minimum)
			// Renvoie une erreure si le mot de passe est trop court
			return res
				.status(400)
				.json({ message: 'le mot de passe doit contenir au moins 6 caractère' });
		}
		// Vérification de la validité de l email avec validator
		if (!validator.isEmail(email)) {
			// Renvoie une erreur si l email est invalide
			return res.status(400).json({ message: 'Entrer un email valide' });
		}
		// Vérification de l email si il existe deja dans la base de données
		const existingUser = await authModel.findOne({ email });
		// Renvoie une erreur si l email exist deja
		if (existingUser) {
			return res.status(400).json({ message: "l'email existe deja" });
		}
		// Création d un nouvel utilisateur
		const user = authModel.create({ email, password });
		// Renvoie une réponse positive si l'utilisateur est bien enregistrer
		res.status(201).json({ message: 'Utilisateur créer avec succès', user });
	} catch (error) {
		// Renvoie une erreur si il y a un probleme lors de l'enregistrement de l'utilisateur
		res.status(500).json({ message: "Erreur lors de l enregistrement de l'/utilisateur" });
	}
};

// Fonction pour la connection
module.exports.login = async (req, res) => {
	try {
		// Recuperation des erreurs de validations
		const errors = validationResult(req);
		// Verification si il y a des erreurs de validation
		if (!errors.isEmpty()) {
			// Renvoie des erreurs de validation
			return res.status(400).json({ errors: errors.array() });
		}
		// Recuperation des donnees du formulaire
		const { email, password } = req.body;

		// Verification si l'utilisateur existe deja dans la base de donnees
		const user = await authModel.findOne({ email });

		// Si l'utilisateur n'existe pas, renvoie une erreur
		if (!user) {
			console.log('Utilisateur non trouvé');
			return res.status(400).json({ message: 'Email invalide' });
		}
		// Verification du mot de passe
		const isPasswordValid = await bcrypt.compare(password, user.password);

		// Si le mot de passe est incorrect, renvoie une erreur
		if (!isPasswordValid) {
			console.log('Mot de passe incorrect');
			return res.status(400).json({ message: 'Mot de passe incorrect' });
		}
		// Renvoie d'un message de succes
		console.log('Connection réussie !');

		// Creation du token jwt
		const payload = {
			user: {
				id: user._id,
				email: user.email,
			},
		};
		// Definition de la variable pour le token
		const secretKey = process.env.JWT_SECRET;

		// Definition de la date d'expiration du token
		const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

		// Renvoie un message de reussite et le totken
		res.status(200).json({ message: 'Connection réussie', token });
	} catch (error) {
		console.error('Erreur lors de connection : ', error.message);
		// Renvoie une erreur si il y a un probleme lors de la connection de l'utilisateur
		res.status(500).json({ message: 'Erreur lors de la connection' });
	}
};
