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
		const { title, description, price, date } = req.body;
		// Vérification si une image est téléchargé
		if (!req.file) {
			return res.status(400).json({ message: 'veuillez télécharger une image' });
		}
		// Déclaration de variable pour récupérer le chemin de l'image après téléchargement
		const imageUrl = req.file.path;
		// Déclaration de variable pour récupérer l'id de l'utilisateur qui va poster une facture
		const userId = req.user._id;
		// Création d une facture
		const newBill = await billModel.create({
			title,
			description,
			price,
			date,
			imageUrl,
			createdBy: userId,
		});
		// Renvoie une réponse positif si la facture est bien enregistrer
		res.status(201).json({ message: 'Facture créée avec succès', bill: newBill });

		// Appel de authModel pour
	} catch (error) {
		console.error('Erreur lors de la création de la facture: ', error.message);
		res.status(500).jso, { message: 'Erreur lors de la création de la facture' };
	}
};

// Fonction pour récupérer toutes les facture
module.exports.getAllBills = async (req, res) => {
	try {
		// Récupération de toutes les factures
		const bills = await billModel.find();
		// réponse de succès
		res.status(200).json({ message: 'liste des factures', bills });
	} catch (error) {
		console.error('Erreur lors de la récupération des factures : ', error.message);
		res.status(500).json({ message: 'Erreur lors de la récupération des factures' });
	}
};
