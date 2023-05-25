// On importe notre model de sauce
const Sauce = require("../models/Sauce");

// On importe filesystem, qui nous permettra de supprimer un fichier que l'utilisateur a créé
const fs = require("fs");

// Création d'un produit
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id; // Suppression de l'id objet car celui-ci sera généré automatiquement
  delete sauceObject._userId; // Suppression de l'userid pour récupérer le token
  const sauce = new Sauce({
    ...sauceObject,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  // Enregistrement du produit (la sauce) dans la bese de données
  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: "Produit créé !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Rechercher un produit
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => res.status(201).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

// On recupère la liste de tous nos produits
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

// Modification du produit
exports.updateSauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  
  // On supprime l'userId fournit par l'utilisateur
  delete sauceObject._userId;
  
  // On recherche la sauce à modifier
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Cette condition vérifie que c'est bien l'utilisateur qui a posté la sauce
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ error });
      } else {
        // Vérifier si une nouvelle image a été fournie
        if (req.file) {
          // Récupérer le nom du fichier de l'ancienne image
          const oldImagePath = sauce.imageUrl.split("/images/")[1];

          // Supprimer physiquement le fichier de l'ancienne image
          fs.unlink(`images/${oldImagePath}`, (err) => {
            if (err) {
              console.error(err);
            }
          });
        }

        // Mise à jour de la sauce
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Produit modifié ! " }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Suppression de produit
exports.deleteOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // On vérifie que c'est bien l'utilisateur qui a posté la sauce
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ error });
      } else { // Si tout est correct on peut supprimer la sauce en totalité
        const filename = sauce.imageUrl.split("/images")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Produit supprimé ! " });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// Gestion des likes et dislikes
exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Premier cas, l'utilisateur n'a pas encore voté et aime cette sauce
      if (
        !sauce.usersLiked.includes(req.body.userId) &&
        !sauce.usersDisliked.includes(req.body.userId) &&
        req.body.like === 1
      ) {
        // Mise à jour de la sauce
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } }
        )
          .then(() =>
            res.status(201).json({ message: "Vous aimez cette sauce" })
          )
          .catch((error) => res.status(400).json({ error }));
      }
      // Deuxième cas, l'utilisateur n'a pas encore voté et n'aime pas cette sauce
      else if (
        !sauce.usersLiked.includes(req.body.userId) &&
        !sauce.usersDisliked.includes(req.body.userId) &&
        req.body.like === -1
      ) {
        // Mise à jour de la sauce
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } }
        )
          .then(() =>
            res.status(201).json({
              message: "Nous sommes navrés que cette sauce ne vous plaise pas",
            })
          )
          .catch((error) => res.status(400).json({ error }));
      }
      // Troisième cas, l'utilisateur enlève son like
      else if (
        sauce.usersLiked.includes(req.body.userId) &&
        req.body.like === 0
      ) {
        // Mise à jour de la sauce
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
        )
          .then(() =>
            res.status(201).json({ message: "Votre like a été retiré" })
          )
          .catch((error) => res.status(400).json({ error }));
      }
      // Quatrième cas, l'utilisateur enlève son dislike
      else if (
        sauce.usersDisliked.includes(req.body.userId) &&
        req.body.like === 0
      ) {
        // Mise à jour de la sauce
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } }
        )
          .then(() =>
            res.status(201).json({ message: "Votre dislike a été retiré" })
          )
          .catch((error) => res.status(400).json({ error }));
      }
      // Cinquième cas, l'utilisateur change son vote de like à dislike
      else if (
        sauce.usersLiked.includes(req.body.userId) &&
        req.body.like === -1
      ) {
        // Mise à jour de la sauce
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { likes: -1, dislikes: 1 },
            $pull: { usersLiked: req.body.userId },
            $push: { usersDisliked: req.body.userId },
          }
        )
          .then(() =>
            res.status(201).json({
              message: "Vous n'aimez plus cette sauce, votre vote a changé",
            })
          )
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
};
