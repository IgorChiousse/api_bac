// Importation du module mongoose
const mongoose = require('mongoose');

// Chargement des variable d'environement
require('dotenv').config();

// Connection a la base de données avant l'exécution de tous les testes
beforeAll(async () => {
	// Utilisation de la méthode connect de mongoose pour établir la connection à la base de données
	await mongoose.connect(process.env.MONGO_URI);
});

// Fermeture de la connection à la bes de données avec exécution de tous les testes
afterAll(async () => {
	// Utilisation de la méthode close mongoose pour fermer la connection à la base de données
	await mongoose.connection.close();
});

// Test vérifiant que la connection à la base de données est bien établie
test('should connect to the database', async () => {
	// La propriété readyState de l'objet mongoose.connection est évalué à 1 lorsque la connection sera établie
	const isConnected = mongoose.connection.readyState === 1;

	// Assertion vérifiant que la connection à la base de données est bien établie
	expect(isConnected).toBeTruthy();
});
