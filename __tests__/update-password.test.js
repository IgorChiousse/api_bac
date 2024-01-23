// Import de mongoose
const mongoose = require('mongoose');
// Import supertest
const request = require('supertest');
// Import application
const app = require('../server');
// Import model
const authModel = require('../models/auth.model');
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
// Bloc de tests pour la route update-password
describe('Testing route /api/update-password/:token', () => {
	// Variable pour stoker le token
	let resetPasswordToken;

	// Avant tous les tests récupérer un utilisateur avec un token valide dans la bdd
	beforeAll(async () => {
		const user = await authModel.findOne({
			email: 'toto@gmail.com',
		});
		// Vérification de l'utilisateur
		if (user) {
			resetPasswordToken = user.resetPasswordToken;
		}
	});
	// Test vérifiant que la route renvoie un code 400 si les mots de passe ne correspondent pas
	it('Should return status code 400 if password do not match', async () => {
		const response = await request(app).put(`/api/update-password/${resetPasswordToken}`).send({
			newPassword: 'newPassword',
			confirmNewPassword: 'DifferentPassword',
		});
		// Vérifier que la réponse attendue est 400
		expect(response.status).toBe(400);
	});
	// Test vérifiant que la route renvoie un code 400 si le token est invalide
	it('Sould return status code 400 if reset password token is invalid', async () => {
		const response = await request(app).put('/api/update-password/invalid-token').send({
			newPassword: 'newPassword',
			confirmNewPassword: 'newPassword',
		});
		// Vérifier que la  réponse est 400
		expect(response.status).toBe(400);
	});
	// Test vérifiant que la route renvoie un code 200
	it('Should return status 200 if password is successfully reset', async () => {
		// S'assurer que la resetPasswordToken est défini avant le test
		console.log('Reset password token:', resetPasswordToken);
		if (resetPasswordToken) {
			const response = await request(app)
				.put(`/api/update-password/${resetPasswordToken}`)
				.send({
					newPassword: '123987',
					confirmNewPassword: '123987',
				});
			// Vérifier que la réponse attendu est 200
			console.log('Response', response.body);
			expect(response.status).toBe(200);
		}
	});
});
