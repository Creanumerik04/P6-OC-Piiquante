// On importe express
const express = require("express");

// On récupère notre router
const router = express.Router();

// On importe notre controlleur utilisateur
const userCtrl = require("../controllers/user");

// Routage de la ressource utilisateur
router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);

// Exportation du module
module.exports = router;