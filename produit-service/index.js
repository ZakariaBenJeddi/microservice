const express = require("express")
const app = express()
const PORT = 4000
const mongoose = require("mongoose")
const Produit = require("./Produit")


app.use(express.json())

mongoose.set('strictQuery', true);

async function connectDB() {
  try {
    // await mongoose.connect("mongodb://localhost/produit-service");
    await mongoose.connect("mongodb://db:27017/produit-service");
    console.log("Produit-Service DB Connected");
  } catch (error) {
    console.error("Erreur de connexion à MongoDB:", error);
    process.exit(1);
  }
}

connectDB();

app.post("/produit/ajouter", (req, res, next) => {
  const {nom , description , prix } = req.body
  const newProduit = new Produit({
    nom,description,prix
  })

  newProduit.save()
  .then(produit => res.status(201).json(produit))
  .catch(error => res.status(400).json({error}))
})


app.post("/produit/acheter", (req, res , next) => {
  const {ids} = req.body
  Produit.find({_id: {$in: ids}})
  .then(produits => res.status(200).json(produits))
  .catch(error => res.status(400).json({error}))
})


app.listen(PORT, ()=>{
  console.log(`Produit-Service at ${PORT}`)
})