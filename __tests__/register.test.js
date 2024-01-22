// Import du module supertest
const request = require('supertest');

// Import du module mongoose
const mongoose = require('mongoose');

// Import de l'application
const app = require('../server');

// Import de path
const path = require('path');

// Connection à la base de données avant l'exécution des tests
beforeAll(async () => {
	// Utilisation de la méthode connect de mongoose
	await mongoose.connect(process.env.MONGO_URI);
	// Attente d'une seconde pour assurer la connection à la base de données
	await new Promise((resolve) => setTimeout(resolve, 100));
});

// Fermeture de la connection après l'éxécution des tests
afterAll(async () => {
	// Utilisation de la méthode close de mongoose pour fermer la connection
	await mongoose.connection.close();
});

// Bloc de test pour la route l'inscription
describe('register route test', () => {
	// Test spécifique pour la création d'un utilisateur
	it("doit retourner 201 si l'utilisateur est créé", async () => {
		// Utilisation de supertest pour envoyer une requete
		const response = await request(app)
			.post('/api/register')
			// Remplissage des champs de formulaire
			.field('lastname', 'Chiousse')
			.field('firstname', 'Igor')
			.field('birthday', '17-07-1980')
			.field('address', '17 rue du port')
			.field('date', '20-01-2024')
			.field('zipcode', '60410')
			.field('city', 'verberie')
			.field('phone', '0601020304')
			.field('email', 'toto@gmail.com')
			.field('password', '147852')
			// Attache un fichier à la requete (exemple image)
			.attach('image', path.resolve(__dirname, '../image/image.png'));

		// Affichage de la réponse reçu dans la console
		console.log('Réponse reçue', response.body);

		// Assertion vérifiant que le status de la réponse est 200
		expect(response.status).toBe(201);

		// Assertion vérifiant que la propriété message contient le message attendu
		expect(response.body).toHaveProperty(
			'message',
			'Utilisateur créer avec succès. Vérifiez votre email pour activer votre compte'
		);
	});
});
