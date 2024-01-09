# Utilisation de l'image de Node.js
FROM node:18

# Création du répertoire de travail dans l'image
WORKDIR /usr/src/app

# Copie des fichiers package.json et package-lock.json pour installer les dépendances
COPY package*.json yarn.lock* ./

# Installation des dépendances
RUN yarn install

# Copie du code source de l'application dans l'image
COPY . .

# Exposer le port sur lequel votre application écoute
EXPOSE 5000

# Commande pour démarrer votre application Node.js
CMD ["yarn", "start"]

