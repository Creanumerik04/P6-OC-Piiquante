// On importe express
const express = require("express");

// Création d'une instance express
const app = express();

// On importe mongoose
const mongoose = require("mongoose");

// On importe la route utilisateur
const userRoutes = require("./routes/user");

// On importe la route des sauces
const sauceRoutes = require("./routes/sauce");

// On accede au chemin de notre serveur
const path = require("path");

require("dotenv").config();

// Connexion à la base de données
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connexion à la base de données réussie !"))
  .catch(() => console.log("Connexion vers la base de données refusée !"));

// On donne la possibilité à express de recevoir et de traiter des données 
app.use(express.json());

// On crée une autorisation pour toutes les requêtes entrantes y compris celles venant d'une autre origine
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// On enregistre les utilisateurs
app.use("/api/auth", userRoutes);

// On enregistre la route des épices
app.use("/api/sauces", sauceRoutes);

// On ajoute le gestionnaire de routage
app.use("/images", express.static(path.join(__dirname, "images")));

// On exporte l'application
module.exports = app;
