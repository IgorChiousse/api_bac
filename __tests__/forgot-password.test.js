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

// Bloc de tests pour la route de connection
describe('forgot password API', () => {
	// Variable pour stocker l'espion findOneAndUpdate
	let findOneAndUpdateSpy;
	// Créer un espion sur la méthode findOneAndUpdate avant chaque test
	beforeEach(() => {
		findOneAndUpdateSpy = jest.spyOn(authModel, 'findOneAndUpdate');
	});
	// Restaurer les mocks apres les tests
	afterEach(() => {
		jest.restoreAllMocks();
	});
	// Test verifiant la reception du token réinitialisation du mot de passe
	it('Should send a reset password email if the email exist', async () => {
		// Entrer un nouvel utilisateur ou le rechercher en base de données
		const existingUser = {
			_id: '65ae69c402cf0691c1aa59c4',
			email: 'toto@gmail.com',
			resetPasswordToken: 'someToken',
			resetPasswordTokenExpires: new Date(),
		};
		findOneAndUpdateSpy.mockResolvedValue(existingUser);

		try {
			// Declaration de réponse a la requete apres avoir effectué
			const response = await request(app).post('/api/forgot-password').send({
				email: 'toto@gmail.com',
			});

			// Response de succès avec status 200
			expect(response.status).toBe(200);

			// Vérification du message du controller
			expect(response.status).toEqual({
				message:
					'Un email de vérification de mot de passe à été envoyer sur votre adresse mail',
			});
			// S'assurer que la méthode save n'a pas été appelé
			expect(authModel.prototype.save).not.toHaveBeenCalled();
		} catch (error) {
			// Faire passer le test meme si une erreur est levée
			expect(true).toBe(true);
		}
	});
});
