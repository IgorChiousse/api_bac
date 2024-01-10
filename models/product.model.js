// Import de mongoose pour la gestion avec la base de données
const mongoose = require('mongoose');

// Définition du shéma du produit
const productSchema = new mongoose.Schema({
	image: {
		type: String,
		required: true,
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
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

// Export du model et du schema et mis dans la variable user
const Product = mongoose.model('Product', productSchema);

// Export de la variable user
module.exports = Product;
