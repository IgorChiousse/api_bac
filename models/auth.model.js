// Import de mongoose pour la gestion avec la base de données
const mongoose = require('mongoose');

// Import de bcrypt pour hashage de mot de passe
const bcrypt = require('bcryptjs');

// Import de validator pour validation d email
const validator = require('validator');

// Définition du shéma de l utilisateur
const authSchema = new mongoose.Schema({
	lastname: {
		type: String,
		required: [true, 'Veuillez entrer votre nom'],
	},
	firstname: {
		type: String,
		required: [true, 'Veuillez entrer votre prénom'],
	},
	birthday: {
		type: String,
		required: [true, 'Veuillez entrer votre date de naissance'],
	},
	address: {
		type: String,
		required: [true, 'Veuillez entrer votre adresse'],
	},
	zipcode: {
		type: String,
		required: [true, 'Veuillez entrer votre code postal'],
	},
	city: {
		type: String,
		required: [true, 'Veuillez entrer votre ville'],
	},
	phone: {
		type: String,
		required: [true, 'Veuillez entrer votre numéro de téléphone'],
	},
	avatarUrl: {
		type: String,
	},
	avatarPublicId: {
		type: String,
		default: null,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		validate: {
			validator: (value) => validator.isEmail(value),
			message: 'Adresse email invalide',
		},
	},
	password: {
		type: String,
		required: [true, 'Veuillez entrer votre mot de passe'],
	},
	role: {
		type: String,
		enum: ['user', 'admin'],
		default: 'user',
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

// Hachage du mot de passe avant de sauvegarder l utilisateur
authSchema.pre('save', async function (next) {
	try {
		if (!this.isModified('password')) {
			return next();
		}
		const hashedPassword = await bcrypt.hash(this.password, 10);
		this.password = hashedPassword;
		return next();
	} catch (error) {
		return next(error);
	}
});

// Méthode pour comparer le mot de passe
authSchema.methods.comparePassword = async function (paramPassword) {
	try {
		return await bcrypt.compare(paramPassword, this.password);
	} catch (error) {
		throw new Error(error);
	}
};

// Export du model et du schema et mis dans la variable auth
const Auth = mongoose.model('Auth', authSchema);

// Export de la variable auth
module.exports = Auth;
