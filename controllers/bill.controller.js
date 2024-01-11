// Import du model utilisateur
const billModel = require('../models/bill.model');
const fs = require('fs');

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
		if (!deletedBill) {
			return res.status(404).json({ message: 'facture non trouvée' });
		}
		res.status(200).json({ message: 'Facture supprimer avec succès' });
	} catch (error) {
		console.error('Erreur lors de la récupération de la facture : ', error.message);
		res.status(500).json({ message: 'Erreur lors de la suppression de la facture' });
	}
};

module.exports.updateBill = async (req, res) => {
	try {
		// Vérifier si l utilisateur est admin
		if (req.user.role !== 'admin') {
			// Retour d un message d erreur
			return res
				.status(403)
				.json({ message: 'Action non autorisé. Seul un admin peu modifier une facture' });
		}
		// Définition de la variable pour récupérer l'id de la facture en parametre d'url
		const billId = req.params.id;
		// Déclaration de variable pour vérifier si la facture existe en base de données
		const existingBill = await billModel.findById(billId);
		// Condition si l'id n existe pas
		if (!existingBill) {
			return res.status(404).json({ message: 'Facture non trouvé' });
		}
		// Mettre à jour les propriété de la facture avec les données du corps de la requete
		existingBill.title = req.body.title || existingBill.title;
		existingBill.description = req.body.description || existingBill.description;
		existingBill.price = req.body.price || existingBill.price;
		existingBill.date = req.body.Date || existingBill.date;

		// Vérifier si une nouvelle image est téléchargé, mettre à jour le chemin de l image
		if (req.file) {
			// Supprimer l'ancienne image
			if (existingBill.image) {
				fs.unlinkSync(existingBill.image);
			}
			// Redonne un chemin a la nouvelle image
			existingBill.imageUrl = req.file.path;
		}
		// Enregistrement des modification dans la base de données
		const updateBill = await existingBill.save();

		// Réponse de succès
		res.status(200).json({ message: 'Facture modifier avec succès', bill: updateBill });
	} catch (error) {
		console.error('Erreur lors de la récupération de la facture : ', error.message);
		res.status(500).json({ message: 'Erreur lors de la modification de la facture' });
	}
};
