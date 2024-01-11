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
				.json({ message: 'Action non autorisé. Seul un admin peu créer une facture' });
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

// Fonction qui va permettre de récupérer une seule facture par son id
module.exports.getBillById = async (req, res) => {
	try {
		// Déclaration de la variable qui va rechercher l'id de la facture
		const billId = req.params.id;
		// Récupération de la facture par son id
		const bill = await billModel.findById(billId);
		// condition si la facture est introuvable
		if (!bill) {
			return res.status(404).json({ message: 'Facture non trouvée' });
		}
		// réponse de succès
		res.status(200).json({ message: 'Factures trouvée avec succès', bill });
	} catch (error) {
		console.error('Erreur lors de la récupération de la facture : ', error.message);
		res.status(500).json({ message: 'Erreur lors de la récupération de la facture' });
	}
};

// Fonction pour suppprimer une facture par son id
module.exports.deleteBill = async (req, res) => {
	try {
		// Vérifier si l utilisateur est admin
		if (req.user.role !== 'admin') {
			// Retour d un message d erreur
			return res
				.status(403)
				.json({ message: 'Action non autorisé. Seul un admin peu supprimer une facture' });
		}
		// Récupérer l id de la facture
		const billId = req.params.id;
		// Supprimer la facture
		const deletedBill = await billModel.findByIdAndDelete(billId);
		// Condition si la facture est introuvable
		if (!deleteBill) {
			return res.status(404).json({ message: 'facture non trouvée' });
		}
		res.status(200).json({ message: 'Facture supprimer avec succès' });
	} catch (error) {
		console.error('Erreur lors de la récupération de la facture : ', error.message);
		res.status(500).json({ message: 'Erreur lors de la suppression de la facture' });
	}
};
