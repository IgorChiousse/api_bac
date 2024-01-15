// Import de mongoose pour la gestion avec la base de données
const mongoose = require('mongoose');

// Définition du shéma du produit
const billSchema = new mongoose.Schema({
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	title: {
		type: String,
		required: [true, 'Veuillez entrer votre produit'],
	},
	description: {
		type: String,
		required: [true, 'Veuillez entrer votre description'],
	},
	price: {
		type: Number,
		required: [true, 'Veuillez entrer votre prix'],
	},
	date: {
		type: Date,
		default: Date.now,
	},
	imageUrl: {
		type: String,
	},
	imagePublicId: {
		type: String,
		default: null,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

// Export du model et du schema et mis dans la variable user
const Bill = mongoose.model('Bill', billSchema);

// Export de la variable user
module.exports = Bill;
