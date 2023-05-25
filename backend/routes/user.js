// On importe express
const express = require("express");

// On récupère notre router
const router = express.Router();

// On importe notre controlleur utilisateur
const userCtrl = require("../controllers/user");

// Compteur d'utilisation des routes
// Mini
let miniRouteUsers = 0;
// Maxi
const maxRouteUsers = 100;

// On ajoute ensuite le middleware de limitation des routes users
const limitRoutes = (req, res, next) => {
    if(miniRouteUsers >= maxRouteUsers) {
        return res.status(429).json({error: "Limite d'utilisateurs atteinte, réessayez ulterieurement."})
    }

    miniRouteUsers++ // On incrémente le compteur d'utilisations
    next();
}

// Routage de la ressource utilisateur
router.post("/signup", limitRoutes, userCtrl.signup);
router.post("/login", limitRoutes, userCtrl.login);

// Exportation du module
module.exports = router;