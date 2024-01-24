// Import mongoose.
const mongoose = require('mongoose');

// Import supertest.
const request = require('supertest');

// Import app.
const app = require('../server');

// Import JWT.
const jwt = require('jsonwebtoken');

// Import model.
const billModel = require('../models/bill.model');

// Fonction utilitaire pour générer un token d'authentification.
function generateAuthToken(userId, role) {
	const secretKey = process.env.JWT_SECRET;
	const expiresIn = '1h';

	// Utilisation de jwt pour générer le token.
	return jwt.sign({ user: { id: userId }, role }, secretKey, { expiresIn });
}

// Connexion à la BDD avant exécution des tests.
beforeAll(async () => {
	// Utilisation de la méthode connect de mongoose.
	await mongoose.connect(process.env.MONGO_URI);
	// Attente d'une seconde pour assurer la connexion à la BDD.
	await new Promise((resolve) => setTimeout(resolve, 1000));
});

// Fermeture de la connexion une fois les tests réalisés.
afterAll(async () => {
	// Utilisation de la méthode close de mongoose pour fermer la connexion.
	await mongoose.connection.close();
});

// Bloc de test pour effacer un produit par son ID.
describe('admin-side delete bill by ID route testing', () => {
	// Test si l'utilisateur est admin.
	it('Should delete one bill by its ID if user trying to do it is an admin.', async () => {
		// ID de l'user admin dans la BDD.
		const adminUserId = '65afc54a384e7e2f3da91dde';

		// Id du produit à update.
		const billIdToDelete = '65b0ec564a67b22000825cda';

		// Générer un token pour l'admin.
		const authToken = generateAuthToken(adminUserId);

		// Faire une demande pour delete.
		const response = await request(app)
			.delete(`/api/delete-bill/${billIdToDelete}`)
			.set('Authorization', `Bearer ${authToken}`);

		// Log de la réponse.
		console.log(response.body);

		// S'assurer que la demande est réussie.
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Facture supprimer avec succès');

		// S'assurer que le produit a bien été supprimé.
		const deleteUser = await billModel.findById(billIdToDelete);
		expect(deleteUser).toBeNull();
	});
});
