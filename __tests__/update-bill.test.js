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

// Bloc de test pour récupérer tous les utilisateurs.
describe('update bill as admin route testing', () => {
	it('Should update one bill by its ID if user trying to get them is an admin.', async () => {
		// ID de l'user admin dans la BDD.
		const adminUserId = '65afc54a384e7e2f3da91dde';

		// Id de l'utilisateur à update.
		const billIdToUpdate = '65b0eb6e6cdfac5993281b9b';

		// Générer un token pour l'admin.
		const authToken = generateAuthToken(adminUserId);

		// Faire une demande pour update.
		const response = await request(app)
			.put(`/api/update-bill/${billIdToUpdate}`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({
				title: 'Gran Turismo (PS1)',
				description: 'Jeu Gran Turismo (PS1)',
				price: '19.99',
				date: '20-01-2024',
			});

		// Log de la réponse.
		console.log(response.body);

		// S'assurer que la demande est réussie.
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Facture modifier avec succès');
		expect(response.body).toHaveProperty('bill');

		// S'assurer que les infos utilisateur ont bien été mises à jour.
		const updatebill = await billModel.findById(billIdToUpdate);
		expect(updatebill.title).toBe('Gran Turismo (PS1)');
		expect(updatebill.description).toBe('Jeu Gran Turismo (PS1)');
		expect(updatebill.price).toBe('19.99');
		expect(updatebill.date).toBe('20-01-2024');
	});
});
