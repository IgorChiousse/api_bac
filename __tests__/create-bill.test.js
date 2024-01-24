// Import mongoose.
const mongoose = require('mongoose');

// Import supertest.
const request = require('supertest');

// Import app.
const app = require('../server');

// Import jwt.
const jwt = require('jsonwebtoken');

// Import model.
const billModel = require('../models/bill.model');

// Import path.
const path = require('path');

// Fonction pour générer un token.
function generateAuthToken(userId) {
	const secretKey = process.env.JWT_SECRET;
	const expiresIn = '1h';

	// Utilisation de jwt pour générer le token.
	return jwt.sign({ user: { id: userId } }, secretKey, { expiresIn });
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

// Bloc de test pour créer un produit en tant qu'admin.
describe('create bill as admin route testing', () => {
	it('Should create a bill if an admin is logged.', async () => {
		//Déclaration de variable pour l'id admin
		const adminIdToCreate = '65afc54a384e7e2f3da91dde';

		// Générer un token admin.
		const authToken = generateAuthToken(adminIdToCreate);

		// Utilisation de supertest pour envoyer une requête.
		const response = await request(app)
			.post('/api/create-bill')
			.field('title', 'Gran Turismo 7 (PS5)')
			.field('description', 'Jeu Gran Turismo 7 (PS5)')
			.field('price', 79.99)
			.field('date', '21.01.2024')
			.attach('image', path.resolve(__dirname, '../image/image.png'))
			.set('Authorization', `Bearer ${authToken}`);

		// Log de la réponse.
		console.log(response.body);

		// S'assurer de la réussite de la demande.
		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty('message', 'Facture créée avec succès');
	});
});
