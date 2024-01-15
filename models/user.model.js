// Import de mongoose pour la gestion avec la base de données
const mongoose = require('mongoose');

// Définition du shéma de user
const userSchema = new mongoose.Schema({
	lastname: {
		type: String,
		required: true,
	},
	firstname: {
		type: String,
		required: true,
	},
	birthday: {
		type: String,
		required: [true, 'Veuillez entrer votre produit'],
	},
	address: {
		type: String,
		required: [true, 'Veuillez entrer votre description'],
	},
	zipcode: {
		type: Number,
		required: [true, 'Veuillez entrer votre prix'],
	},
	city: {
		type: String,
		required: true,
	},
	phone: {
		type: String,
		required: true,
	},
	avatarUrl: {
		type: String,
	},
	avatarPublicId: {
		type: String,
		default: null,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

// Export du model et du schema et mis dans la variable user
const User = mongoose.model('User', userSchema);

// Export de la variable user
module.exports = User;
