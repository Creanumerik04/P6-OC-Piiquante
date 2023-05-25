// On importe le modele utilisateur
const User = require("../models/User");

// On importe bcrypt pour pouvoir hasher le mot de passe
const bcrypt = require("bcrypt");

// Importation du package d'identification de token
const jwt = require("jsonwebtoken");

// Importation des variables d'environnement
require("dotenv").config();

// Fonction inscription pour créer un nouvel utilisateur
exports.signup = (req, res, next) => {
  // On hash le mot de passe
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({ // On créé un modèle utilisateur avec son mail et son password hashé
        email: req.body.email,
        password: hash,
      });
      // On sauvegarde l'utilisateur dans la base de données
      user
        .save()
        .then(() =>
          res.status(201).json({ message: "Utilisateur enregistré !" })
        )
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// Fonction de connexion pour un utilisateur déjà inscrit
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      // Vérification de l'utilisateur
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé" });
      }
      // Controle du mot de passe entré par l'utilisateur et celui hashé par bcrypt
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) { // Si le mot de passe entré est différent de celui hashé alors renvoyer une erreur
            return res.status(401).json({ error: "Mot de passe incorrect" });
          }
          // Si tout est bon (email + mot de passe) alors création du token qui expire au bout de 24h
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, `${process.env.USER_TOKEN}`, {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
