// Import de mongoose
const mongoose = require('mongoose');
// Import supertest
const request = require('supertest');
// Import application
const app = require('../server');
// Bloc de test pour vérifier la route /api/profile/:id
describe('Get Profile API', () => {
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
	// Test vérifiant que la route /api/profile/:id renvoie le profile de l'utilisateur connecté (connexion)
	it('Should return profile of the authenticated user', async () => {
		// Effectue la connection et récupèrer le token
		const loginResponse = await request(app).post('/api/login').send({
			email: 'toto@gmail.com',
			password: '123987',
		});
		// Vérifier que la connection est réussie
		expect(loginResponse.status).toBe(200);
		expect(loginResponse.body).toHaveProperty('token');

		// Récupérer le token pour le test suivant
		const authToken = loginResponse.body.token;

		// Déclaration variable utilisateur avec son id
		const userId = '65ae69c402cf0691c1aa59c4';

		// Test pour vérifier que la route /api/profile/:id renvoie le profil de l'utilisateur connecté
		const responseProfile = await request(app)
			.get(`/api/profile/${userId}`)
			.set('Authorization', `Bearer ${authToken}`);

		// Vérifier que la response est réussie
		expect(responseProfile.status).toBe(200);
		// Afficher l'utilisateur dans la console
		console.log('Utilisateur récupérer:', responseProfile.body.user);
	});
});
