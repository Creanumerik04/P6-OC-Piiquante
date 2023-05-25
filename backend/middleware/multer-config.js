// On importe le package multer
const multer = require("multer");

// On configure les types d'extensions d'images acceptées
const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpeg",
    "image/png": "png"
};

// On indique a multer où il doit enregistrer les fichiers entrants
const storage = multer.diskStorage({
    // On indique à multer dans quel dossier il doit enregistrer les images
    destination: (req, file, callback) => {
        callback(null, "images")
    },
    // On indique à multer le nom d'origine et qu'il doit remplacer les espaces par des underscores
    filename: (req, file, callback) => {
        const name = file.originalname.split(" ").join("_").split(".")[0];
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + "_" + Date.now() + "." + extension);
    }
});

// On exporte le middleware multer entièrement configure
// Nous lui indiquons que nous gérons uniquement les téléchargements d'images
module.exports = multer({ storage }).single("image");