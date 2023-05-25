// On importe express
const express = require("express");

// Création du router express
const router = express.Router();

// On importe notre fichier middleware pour protéger notre route sauces
const auth = require("../middleware/auth");

// On importe notre middleware multer
// On l'importe après les middleware d'authentification
// Sinon les images de requètes non-authentifiées seront enregistrées
const multer = require("../middleware/multer-config");

// Importation du controller
const sauceCtrl = require("../controllers/sauce");

// Création d'une sauce
router.post("/", auth, multer, sauceCtrl.createSauce);

// On regarde une sauce spécifique
router.get("/:id", auth, sauceCtrl.getOneSauce);

// On modifie une sauce déjà postée
router.put("/:id", auth, multer, sauceCtrl.updateSauce);

// On supprime une sauce
router.delete("/:id", auth, sauceCtrl.deleteOneSauce);

// On a une liste de toutes les sauces disponible
router.get("/", auth, sauceCtrl.getAllSauces);

// Gestion des mentions j'aime/je n'aime pas (likes/dislikes)
router.post("/:id/like", auth, sauceCtrl.likeSauce);

// Exportation du module
module.exports = router;