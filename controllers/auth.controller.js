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

// Import de nodemailer pour l'envoie de mail
const nodemailer = require('nodemailer');

const crypto = require('crypto');

const transporter = nodemailer.createTransport({
	host: 'sandbox.smtp.mailtrap.io',
	port: 2525,
	auth: {
		user: process.env.MAILTRAP_USER,
		pass: process.env.MAILTRAP_PASS,
	},
});

// Déclaration de variable pour générer un token avec crypto
const generateVerificationToken = () => {
	return crypto.randomBytes(32).toString('hex');
};

// Fonction de vérification email
const sendVerificationEmail = async (to, verificationToken) => {
	// Variable qui va contenir le lien de vérification
	const verificationLink = `http://localhost:5000/verify?token=${verificationToken}`;

	const mailOptions = {
		from: 'verificationEmail@gmail.com',
		to,
		subject: 'Veuillez vérifier votre address email',
		text: `Merci de verifier votre email en cliquant sur ce <a href=${verificationLink}>Lien</a>`,
		html: `<p>Merci de cliquer sur ce lien pour verifier votre adresse email et pour vous connecter</p>`,
	};

	await transporter.sendMail(mailOptions);
};

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
			// Suprimer l'image si elle existe
			if (req.file && req.file.public_id) {
				await cloudinary.uploader.destroy(req.file.public_id);
				console.log('Image supprimer car email existant');
			}
			return res.status(400).json({ message: "l'email existe deja" });
		}

		// Utilisation de l'Url de cloudinary et du public_id provenant du middleware
		const avatarUrl = req.cloudinaryUrl;
		const avatarPublicId = req.file.public_id;

		// Création d un nouvel utilisateur
		const auth = await authModel.create({
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

		// Génération de la vérification de token sécurisé
		const verificationToken = generateVerificationToken();

		// Sauvegarde le token générer dans la base de données et l'associer à l'utilisateur
		auth.emailVerificationToken = verificationToken;
		auth.isEmailVerifiedExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

		// Sauvegarder
		await auth.save();

		// Envoyer la vérification d'email
		await sendVerificationEmail(auth.email, verificationToken);

		// Renvoie une réponse positive si l'utilisateur est bien enregistrer
		res.status(201).json({
			message:
				'Utilisateur créer avec succès. Vérifiez votre email pour activer votre compte',
			auth,
		});
	} catch (error) {
		console.error("Erreur lors de l'enregistrement de l'utilisateur : ", error.message);
		// Suprimer l'image si elle existe
		if (req.file && req.file.public_id) {
			await cloudinary.uploader.destroy(req.file.public_id);
		}
		// Renvoie une erreur si il y a un probleme lors de l'enregistrement de l'utilisateur
		res.status(500).json({ message: "Erreur lors de l enregistrement de l'utilisateur" });
	}
};

// Fonction pour la vérification d'email
module.exports.verifyEmail = async (req, res) => {
	try {
		// Récupération du token pour le mettre en paramettre d'URL
		const { token } = req.params;

		// Trouver l'utilisateur avec le token associé
		const user = await authModel.findOne({ emailVerificationToken: token });
		if (!user) {
			return res.status(404).json({ message: 'Utilisateur non trouvé' });
		}
		// Vérifier si le token n'a pas expiré
		if (user.isEmailVerifiedExpires && user.isEmailVerifiedExpires < Date.now()) {
			return res.status(400).json({ message: 'Le token à expiré' });
		}
		// Mettre à jour isEmailVerified à true et sauvegardé
		user.isEmailVerified = true;
		// Effacer le token après vérification
		user.emailVerificationToken = undefined;
		// Effacer la date d'expiration
		user.isEmailVerifiedExpires = undefined;
		// Sauvegarder
		await user.save();

		// Message de réussite
		res.status(200).json({ message: 'Email vérifier avec succès' });
	} catch (error) {
		console.error("Erreur lors de la vérification d'email ; ", error.message);
		res.status(500).json({ message: "Erreur lors de la vérification d'email" });
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

// Fonction pour accéder à une route protégé
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
		const { lastname, firstname, birthday, address, zipcode, city, phone, email, newPassword } =
			req.body;

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

		// Mettre à jour le mot de passe uniquement si fourni dans la requête
		if (newPassword) {
			existingUser.password = newPassword;
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

// Fonction pour supprimer mon profil
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

// Fonction pour voir tous les utilisateur en tant qu'admin
module.exports.getAllUsers = async (req, res) => {
	try {
		// Vérifier si l utilisateur est admin
		if (req.user.role !== 'admin') {
			// Retour d un message d erreur
			return res.status(403).json({
				message: 'Action non autorisé. Seul un admin peu voir un utilisateur',
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

// Fonction pour voir mon profil avec son id
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

// Fonction pour voir mon profil
module.exports.profile = async (req, res) => {
	try {
		const userId = req.params.id;
		const user = await authModel.findById(userId);
		if (!user) {
			res.status(404).json({ message: 'profil non trouvé' });
		}
		// Message de réussite
		res.status(200).json({ message: 'profil récupérer avec succès', user });
	} catch (error) {
		console.error('Erreur lors de la récupération du profil: ', error.message);
		res.status(500).jso, { message: 'Erreur lors de la récupération du profil' };
	}
};

// Fonction pour modifier un utilisateur en tant qu'admin
module.exports.updateUser = async (req, res) => {
	try {
		// Vérifier si l utilisateur est admin
		if (req.user.role !== 'admin') {
			// Retour d un message d erreur
			return res.status(403).json({
				message: 'Action non autorisé. Seul un admin peu modifier un utilisateur',
			});
		}
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

// Fonction pour supprimer un utilisateur en tant qu'admin
module.exports.deleteUser = async (req, res) => {
	try {
		// Vérifier si l utilisateur est admin
		if (req.user.role !== 'admin') {
			// Retour d un message d erreur
			return res.status(403).json({
				message: 'Action non autorisé. Seul un admin peu supprimer un utilisateur',
			});
		}
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
