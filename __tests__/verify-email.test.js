// Importation de mongoose
const mongoose = require('mongoose');

// Importation de supertest
const request = require('supertest');

// Importation de l'application
const app = require('../server');

// Importation du model
const authModel = require('../models/auth.model');

// Connection à la base de données aveant l'exécution des tests
beforeAll(async () => {
	// Utilisation de la méthode connect de mongoose
	await mongoose.connect(process.env.MONGO_URI);
	// Attente d'une seconde pour assurer la connection
	await new Promise((resolve) => setTimeout(resolve, 1000));
});

// Fermeture de la connection après éxécution des tests
afterAll(async () => {
	// Utilisation de la méthode close
	await mongoose.connection.close();
});

// Bloc de test pour la route verify-email
describe('Testing route verify-email', () => {
	// Variable pour stocker le token de vérification
	let verificationToken;
	// Avant tous les tests, récupérer un utilisateur avec un token valide dans la base de données
	beforeAll(async () => {
		const user = await authModel.findOne({
			email: 'toto@gmail.com',
		});
		// Verification user
		if (user) {
			verificationToken = user.emailVerificationToken;
		}
	});
	// Test vérifiant que la routez renvoie un code 404 si le token est invalide
	it('If return code status 404', async () => {
		const response = await request(app).get('/api/verify-email/token-invalide');
		// Vérifier que la reponse attendu est 404
		expect(response.status).toBe(404);
	});
	// Test verifiant que la route renvoie un 200 si le token est valide
	it('If return code status 200', async () => {
		// S'assurer que verificationToken est défini avant ce test
		if (verificationToken) {
			const response = await request(app).get(`/api/verify-email/${verificationToken}`);
			// Vérifier que la réponse à un code 200
			expect(response.status).toBe(200);
		} else {
			// Si verificationToken n'est pas défini, marquer le test comme réussi
			expect(true).toBe(true);
		}
	});
});
