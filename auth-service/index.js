const express = require("express")
const app = express()
const PORT = 4002
const mongoose = require("mongoose")
const Utilisateur = require("./Utilisateur")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs')

app.use(express.json())

mongoose.set('strictQuery', true);

async function connectDB() {
  try {
    await mongoose.connect("mongodb://localhost/auth-service");
    console.log("Auth-Service DB Connected");
  } catch (error) {
    console.error("Erreur de connexion à MongoDB:", error);
    process.exit(1);
  }
}

connectDB();

app.post("/auth/register", async (req, res, next) => {
  let {nom , email , mot_passe} = req.body
  const userExists = await Utilisateur.findOne({email})

  if(userExists){
    return res.status(400).json({error:"Utilisateur existe déjà"})
  }
  else{
    bcrypt.hash(mot_passe, 10, async (err, hash) => {
      if (err) {
        return res.status(500).json({ error: "Erreur de hachage" });
      }
      const newUtilisateur = new Utilisateur({
        nom,
        email,
        mot_passe: hash
      })
      await newUtilisateur.save()
      .then(user => res.status(201).json(user))
      .catch(error => res.status(400).json({error}))
    })
  }
})

app.post("/auth/login", async (req, res, next) => {
  const {email , mot_passe} = req.body
  const utilisateur = await Utilisateur.findOne({email})
  if(!utilisateur){
    return res.status(400).json({error:"Utilisateur introuvale"})
  }
  else{
    bcrypt.compare(mot_passe, utilisateur.mot_passe, (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Erreur de comparaison" });
      }
      if (!result) {
        return res.status(401).json({ error: "Mot de passe incorrect" });
      }
      const token = jwt.sign({ id: utilisateur._id }, "secret", { expiresIn: "1h" });
      res.status(200).json({ token });
    });
  }
})


app.listen(PORT, ()=>{
  console.log(`Produit-Service at ${PORT}`)
})