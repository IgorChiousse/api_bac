// Import du model utilisateur
const billModel = require('../models/bill.model');

// Fonction pour la creation de facture (accessible seulement par l administrateur)
module.exports.createBill = async (req, res) => {
	try {
		// Vérifier si l utilisateur est admin
		if (req.user.role !== 'admin') {
			// Retour d un message d erreur
			return res
				.status(403)
				.json({ message: 'Action non autorisé. Seul un admin peu créer un produit' });
		}
		// Récupération des données du formulaire
		const { title, description, price } = req.body;
		// Création d une facture
		const newBill = await billModel.create({ title, description, price });
		// Renvoie une réponse positif si la facture est bien enregistrer
		res.status(201).json({ message: 'Facture créée avec succès', bill: newBill });

		// Appel de authModel pour
	} catch (error) {
		console.error('Erreur lors de la création de la facture: ', error.message);
		res.status(500).jso, { message: 'Erreur lors de la création de la facture' };
	}
};