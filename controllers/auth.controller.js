// Import du model utilisateur
const authModel = require('../models/auth.model');

// Import de la validation des données
const { validationResult } = require('express-validator');

// Import du model hachage bcrypt
const bcrypt = require('bcryptjs');

// Import du model jwt pour les tokens
const jwt = require('jsonwebtoken');

// Import du module cloudinary
const cloudinary = require('cloudinary').v2;

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
		const { lastname, firstname, birthday, address, zipcode, city, phone, email, password } =
			req.body;

		// Vérifier si une image est téléchargée
		if (!req.cloudinaryUrl || !req.file) {
			return res.status(400).json({ message: 'Veuillez télécharger une image' });
		}
		// Vérification de l email si il existe deja dans la base de données
		const existingAuth = await authModel.findOne({ email });
		// Renvoie une erreur si l email exist deja
		if (existingAuth) {
			return res.status(400).json({ message: "l'email existe deja" });
		}

		// Utilisation de l'Url de cloudinary et du public_id provenant du middleware
		const avatarUrl = req.cloudinaryUrl;
		const avatarPublicId = req.file.public_id;

		// Création d un nouvel utilisateur
		const auth = authModel.create({
			lastname,
			firstname,
			birthday,
			address,
			zipcode,
			city,
			phone,
			email,
			password,
			avatarUrl,
			avatarPublicId,
		});

		// Renvoie une réponse positive si l'utilisateur est bien enregistrer
		res.status(201).json({ message: 'Utilisateur créer avec succès', auth });
	} catch (error) {
		console.error(error);
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

// Fonction pour le dashboard
module.exports.dashboard = async (req, res) => {
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
};

// Fonction pour la modification du profil
module.exports.update = async (req, res) => {
	try {
		// Déclaration de variable pour la gestion des erreurs de validation
		const errors = validationResult(req);
		// Vérification si il y a des erreurs de validation
		if (!errors.isEmpty()) {
			// Renvoie des erreurs de validation
			return res.status(400).json({ errors: errors.array() });
		}

		// Récupération de l id de l'utilisateur pour le mettre en params de requête
		const userId = req.params.id;

		// Récupération des données du formulaire
		const { lastname, firstname, birthday, address, zipcode, city, phone, email } = req.body;

		// Vérifier si l utilisateur existe avant la mise à jour
		const existingUser = await authModel.findById(userId);

		// Condition si l'utilisateur n'existe pas en base de données
		if (!existingUser) {
			return res
				.status(404)
				.json({ message: 'Erreur lors de la mise à jour du profil utilisateur' });
		}

		// Vérifier si une nouvelle image est télécharger mettre à jour une nouvelle image
		if (req.file) {
			if (existingUser.avatarPublicId) {
				await cloudinary.uploader.destroy(existingUser.avatarPublicId);
			}
			// Redonne une nouvelle url et un nouvel id a l'image
			existingUser.avatarUrl = req.cloudinaryUrl;
			existingUser.avatarPublicId = req.file.public_id;
		}

		// Mettre à jour les information de l'utilisateur
		existingUser.lastname = lastname;
		existingUser.firstname = firstname;
		existingUser.birthday = birthday;
		existingUser.address = address;
		existingUser.zipcode = zipcode;
		existingUser.city = city;
		existingUser.phone = phone;

		// Mettre à jour l email uniquement si fournis dans la requête
		if (email) {
			existingUser.email = email;
		}

		// Sauvegarder les modification
		await existingUser.save();

		// Code de réussite avec log
		res.status(200).json({
			message: 'Utilisateur lise à jour avec succès',
			user: existingUser,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Erreur de la mise à jour du profil utilisateuer' });
	}
};

module.exports.delete = async (req, res) => {
	try {
		// Déclaration de la variable qui va rechercher l'id de l'utilisateur pour mettre en params url
		const userId = req.params.id;

		// Déclaration de variable qui va vérifier si l'utilisateur existe
		const existingUser = await authModel.findById(userId);

		// Suppression de l avatar de cloudinary si celui ci existe
		if (existingUser.avatarPublicId) {
			await cloudinary.uploader.destroy(existingUser.avatarPublicId);

			// Suppression de l'utilisateur de la base de données
			await authModel.findByIdAndDelete(userId);

			// Message de réussite
			res.status(200).json({ message: 'Utilisateur supprimer avec succès' });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur" });
	}
};

module.exports.getAllUsers = async (req, res) => {
	try {
		// Vérifier si l utilisateur est admin
		if (req.user.role !== 'admin') {
			// Retour d un message d erreur
			return res.status(403).json({
				message: 'Action non autorisé. Seul un admin peu récupérer un utilisateur',
			});
		}
		const users = await authModel.find();
		// Message de réussite
		res.status(200).json({ message: 'Utilisateur récupérer avec succès', users });
	} catch (error) {
		console.error('Erreur lors de la récupération des users: ', error.message);
		res.status(500).jso, { message: 'Erreur lors de la récupération des users' };
	}
};

module.exports.getUserById = async (req, res) => {
	try {
		// Vérifier si l utilisateur est admin
		if (req.user.role !== 'admin') {
			// Retour d un message d erreur
			return res.status(403).json({
				message: 'Action non autorisé. Seul un admin peu récupérer un utilisateur',
			});
		}
		const userId = req.params.id;
		const user = await authModel.findById(userId);
		if (!user) {
			res.status(404).json({ message: 'Utilisateur non trouvé' });
		}
		// Message de réussite
		res.status(200).json({ message: 'Utilisateur récupérer avec succès', userId });
	} catch (error) {
		console.error("Erreur lors de la récupération de l'utilisateur: ", error.message);
		res.status(500).jso, { message: "Erreur lors de la récupération de l'utilisateur" };
	}
};
