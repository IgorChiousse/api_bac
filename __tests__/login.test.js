// Import mongoose
const mongoose = require('mongoose');

// Import supertest
const request = require('supertest');

// Import app
const app = require('../server');

// Import bcrypt
const bcrypt = require('bcryptjs');

// Import jwt
const jwt = require('jsonwebtoken');

// Import model
const authModel = require('../models/auth.model');

// Connection à la base de données avant execution des tests
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

// Bloc de tests pour la route de connection
describe('Login api', () => {
	// Test spécififique pour vérifier que la route renvoie en jwt en cas de connection réussie
	it('Should return a token if login succès', async () => {
		// On suppose que nous avons un utilisateur en base de données
		const existingUser = {
			_id: new mongoose.Types.ObjectId(),
			email: 'toto@gmail.com',
			// Hachage du mot de passe
			password: await bcrypt.hash('147852', 10),
		};
		// Simulation de la méthode findOne  pour renvoyer l'utilisateur existant lorsqu elle est appellé
		jest.spyOn(authModel, 'findOne').mockResolvedValue(existingUser);

		// Effectuer la requete de connection a la route /api/login
		const response = await request(app).post('/api/login').send({
			email: 'toto@gmail.com',
			// Fournir le mot de passe en claire pour la connection
			password: '147852',
		});
		// Vérifier que la réponse est réussie
		expect(response.status).toBe(200);

		// Vérifier que la réponse contient un jeton(token)
		expect(response.body).toHaveProperty('token');

		// Décoder le token pour vérifier son contenu
		const decodedToken = jwt.verify(response.body.token, process.env.JWT_SECRET);

		// Vérifier que le token contient les informations attendues
		expect(decodedToken).toHaveProperty('user');
		expect(decodedToken.user).toHaveProperty('id', existingUser._id.toHexString());
		expect(decodedToken.user).toHaveProperty('email', existingUser.email);
	});
});
