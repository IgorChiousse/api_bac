// Import de mongoose
const mongoose = require('mongoose');
// Import supertest
const request = require('supertest');
// Import application
const app = require('../server');
// Import de JWT
const jwt = require('jsonwebtoken');
// Import model
const authModel = require('../models/auth.model');
// Fonction utilisateur pour générer un token d'authentification
function generateAuthToken(userId) {
	const secretKey = process.env.JWT_SECRET;
	const expiresIn = '1h';
	// Utilisation de JWT pour générer le token
	return jwt.sign({ user: { userId } }, secretKey, { expiresIn });
}

// Connection à la base de données avant execution des test
beforeAll(async () => {
	// Utilisation de la méthode connect
	await mongoose.connect(process.env.MONGO_URI);
	// Attente d'une seconde pour assurer la connection a la base de données
	await new Promise((resolve) => setTimeout(resolve, 1000));
});
// Fermeture de la connection après les tets
afterAll(async () => {
	// Utilisation de la méthode close
	await mongoose.connection.close();
});
// Bloc de test pour récupérer les utilisateurs
describe('users API', () => {
	it('Should get users if admin is authenticated', async () => {
		// Id de l'utilisateur admin dans la base de données
		const adminUserId = '65afc54a384e7e2f3da91dde';

		const authToken = generateAuthToken(adminUserId);

		// Faire une demande pour récupérer tous les utilisateurs
		const response = await request(app)
			.get('/api/users')
			.set('Authorization', `Bearer ${authToken}`);

		// Log de la réponse
		console.log(response.body);
		// S'assurer de la réussite de la demande
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Utilisateur récupérer avec succès');
		expect(response.body).toHaveProperty('users');
	});
});
