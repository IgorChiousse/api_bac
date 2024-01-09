// Chargement des variables d'environnement 
require('dotenv').config();

// Import des modules necessaires
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import des routes pour l'authentification
const authRoutes = require('./routes/auth.route');

// Import de la configuration de la base de données
const connectDB = require('./config/db');

// Initialisation de l'application Express 
const app = express();

// Middleware pour traiter les requêtes JSON
app.use(express.json());

// Middleware pour parser les corps de requêtes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Utilisation des routes pour l'authentification
app.use('/api', authRoutes);

// Configuration des options cors
const corsOptions = {
    credentials: true,
    optionsSuccessStatus: 200,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    preflightContinue: false,
};

// Middleware pour gérer les cors
app.use(cors(corsOptions));

// Définition du port demarrage du serveur
const PORT = process.env.PORT || 5200;

// Fonction pour demarrer le serveur
const start = async () => {
    try {
        // Connexion a la base de donnée
        await connectDB();
        // Démarrage du serveur sur le port spécifié
        app.listen(PORT, () => console.log(`Le serveur a démarré sur le port ${PORT}`));
    } catch (error) {
        console.log(error);
    }
}

// Apple de la fonction pour demarrer le serveur
start();
