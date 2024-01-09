// Import mongoose
const mongoose = require('mongoose');

// Dfinition de l url à la base de données
const url = process.env.MONGO_URI;

const connectDB = () => {
    mongoose
        .connect(url)
        // le point .then() et le .catch() sont des prommesse qui permenttent de gérer la connexion a la base de donnéeset capturer les erreur 
        .then(() => {
            console.log('connection à la base de données');
        })
        .catch((err) => {
            console.log('Erreur avec la base de données', err.message);
        });
};

// Export de la fonction connectDB 
module.exports = connectDB;