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
// Bloc de test pour récupérer les utilisateurs
describe('UpdateUserAdmin API', () => {
	it('Should allow updating user profile by admin', async () => {
		// Id de l'utilisateur admin dans la base de données
		const adminUserId = '65afc54a384e7e2f3da91dde';

		const userIdToUpdate = '65ae69c402cf0691c1aa59c4';

		const authToken = generateAuthToken(adminUserId);

		// Faire une demande pour récupérer tous les utilisateurs
		const response = await request(app)
			.put(`/api/update-user/${userIdToUpdate}`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({
				lastname: 'nouveauNom',
				firstname: 'nouveauprénom',
				birthday: '17-07-1980',
				address: '17 rue de compiegne',
				zipcode: '60200',
				city: 'compiegne',
				phone: '0701020304',
				email: 'caca@gmail.com',
			});

		// Log de la réponse
		console.log(response.body);
		// S'assurer de la réussite de la demande
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Utilisateur mis à jour avec succès');
		expect(response.body).toHaveProperty('user');

		// S'assurer que les informations de l'utilisateur ont bien été mis a jour
		const updateUser = await authModel.findById(userIdToUpdate);
		expect(updateUser.lastname).toBe('nouveauNom');
		expect(updateUser.firstname).toBe('nouveauprénom');
		expect(updateUser.birthday).toBe('17-07-1980');
		expect(updateUser.address).toBe('17 rue de compiegne');
		expect(updateUser.zipcode).toBe('60200');
		expect(updateUser.city).toBe('compiegne');
		expect(updateUser.phone).toBe('0701020304');
		expect(updateUser.email).toBe('caca@gmail.com');
	});
});
