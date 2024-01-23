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
function generateAuthToken(userId, role) {
	const secretKey = process.env.JWT_SECRET;
	const expiresIn = '1h';
	// Utilisation de JWT pour générer le token
	return jwt.sign({ userId, role }, secretKey, { expiresIn });
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

// Bloc de text pour vérifier si je peux accéder au dashboard en tant qu'admin
describe('Dashboard api', () => {
	it('Should allow access to the dashboard for admin', async () => {
		// Id de l'utilisateur admon dans la bdd
		const adminUserId = '65afc54a384e7e2f3da91dde';
		// Générer un token pour l'admin
		const authToken = generateAuthToken(adminUserId, 'admin');
		// Faire la demande pour acceder au dashboard
		const response = await request(app)
			.get('/api/dashboard')
			.set('Authorization', `Bearer ${authToken}`);
		// Log de la réponse
		console.log(response.body);
		// S'assurer de la réussite de la demande
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Bienvenue Admin');
	});
	// Test si l'utilisateur n'a pas le role admin
	it('Should return an error for non-admin users trying to access the dashboard', async () => {
		// Id d'un utilisateur non admin dans la base de données
		const nonAdminUserId = '65ae69c402cf0691c1aa59c4';
		// Générer un token
		const authToken = generateAuthToken(nonAdminUserId, 'user');
		// Faire la demande pour acceder au dashboard
		const response = await request(app)
			.get('/api/dashboard')
			.set('Authorization', `Bearer ${authToken}`);
		// Log de la réponse
		console.log(response.body);
		// S'assurer de la reponse est un 403
		expect(response.status).toBe(403);
		expect(response.body).toHaveProperty(
			'message',
			'action non autorisée, seul les admins peuvent accéder à cette page'
		);
	});
});
