const express = require("express");
const app = express();
const PORT = 4001;
const mongoose = require("mongoose");
const Commande = require("./Commande");
const axios = require("axios");
const isAuthenticated = require("./isAuthenticated");

app.use(express.json());

mongoose.set("strictQuery", true);

async function connectDB() {
  try {
    await mongoose.connect("mongodb://localhost/commande-service");
    console.log("Commande-Service DB Connected");
  } catch (error) {
    console.error("Erreur de connexion à MongoDB:", error);
    process.exit(1);
  }
}

connectDB();

// Fonction pour calculer le prix total des produits
function prixTotal(produits) {
  let total = 0;
  for (let t = 0; t < produits.length; ++t) {
    total += produits[t].prix;
  }
  console.log("Prix total :", total);
  return total;
}

// Fonction pour récupérer les détails des produits à partir du service produit
async function httpRequest(ids) {
  try {
    const URL = "http://localhost:4000/produit/acheter";
    const response = await axios.post(
      URL,
      { ids: ids },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return prixTotal(response.data);
  } catch (error) {
    console.error(error);
    return 0; // Retourne 0 en cas d'erreur
  }
}

// Route pour ajouter une commande
app.post("/commande/ajouter", isAuthenticated ,async (req, res) => {
  // const { ids, email_utilisateur } = req.body;
  const {ids} = req.body
  try {
    const total = await httpRequest(ids);
    const newCommande = new Commande({
      produits: ids,
      email_utilisateur: req.user.email,
      prix_total: total,
    });

    const savedCommande = await newCommande.save();
    res.status(201).json(savedCommande);
  } catch (error) {
    res.status(400).json({ error });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Commande-Service at ${PORT}`);
});
