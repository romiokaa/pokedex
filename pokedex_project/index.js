require('dotenv').config();
const express = require('express');

const pokemonsRoutes = require('./src/routes/pokemons');
const weatherRoutes = require('./src/routes/weather');

const app = express();
app.use(express.json());

app.use('/pokemons', pokemonsRoutes);
app.use('/pokemons', weatherRoutes);

app.listen(3000, () => console.log('Serveur lancé sur http://localhost:3000'));
