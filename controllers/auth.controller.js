// Import du model utilisateur
const authModel = require('../models/auth.model');

// Import de la validation des données
const { validationResult } = require('express-validator');

// Import du model hachage bcrypt
const bcrypt = require('bcrypt');

// Import du model jwt pour les tokens
const jwt = require('jsonwebtoken');

// fonction pour l inscription
module.exports.register = async (req, res) => {
    // Validation des données d'entrée
    try {
        // Récupération des erreurs de validation
        const errors = validationResult(req);
        // Vérification si il y a des erreurs de validation 
        if(!errors.isEmpty()){
            // Renvoie des erreurs de validation
            return res.status(400).json({errors: errors.array() });
        }
        // Récupération des données du formulaire
        const { lastname, firstname, email, password } = req.body;

        // Vérification de la longueur du mot de passe avec une condition
        if(password.length < 6) {
            // Vérification de la longueur du mot de passe (6carractere minimum)
            // Renvoie une erreure si le mot de passe est trop court
            return res.status(400).json({ message: 'le mot de passe doit contenir au moins 6 caractère'});
        }
        // Vérification de l email si il existe deja dans la base de données
        const existingUser = await authModel.findOne({email});
        // Renvoie une erreur si l email exist deja
        if(existingUser) {
            return res.status(400).json({ message: 'l email existe deja'})
        }
        // Création d un nouvel utilisateur
        const user = authModel.create({lastname, firstname, email, password});
        // Renvoie une réponse positive si l'utilisateur est bien enregistrer
        res.status(201).json({message: 'Utilisateur créer avec succès', user})
    } catch (error) {
        // Renvoie une erreur si il y a un probleme lors de l'enregistrement de l'utilisateur
        res.status(500).json({message: "Erreur lors de l enregistrement de l'/utilisateur"});
        
    }

};