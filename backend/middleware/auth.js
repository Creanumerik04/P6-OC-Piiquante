// On importe notre package de token
const jwt = require("jsonwebtoken");

// On importe nos variables d'environnement
require("dotenv").config();

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1] || process.env.USER_TOKEN;
    // Décodage du token
    const decodedToken = jwt.verify(token, process.env.USER_TOKEN);
    // Récupération de l'identifiant utilisateur
    const userId = decodedToken.userId;
    // Création de l'objet auth qui contient la valeur du token décodé
    req.auth = {
      userId: userId,
    };
    // Ajouter le token à la réponse de l'API
    // res.setHeader("X-Auth-Token", token);
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
