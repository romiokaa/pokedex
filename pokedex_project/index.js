const express = require('express');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const redis = require('redis');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

const redisClient = redis.createClient();
redisClient.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
  await redisClient.connect();
})();

const WEATHER_API_KEY = '487c3bfd01d350f348d40b8f72ed55f8';

// Récupérer la météo avec cache Redis
async function getWeather(city) {
  const cached = await redisClient.get(city);
  if (cached) {
    return JSON.parse(cached);
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;
  const response = await axios.get(url);
  const data = response.data;

  // cache 10 min
  await redisClient.setEx(city, 600, JSON.stringify(data));

  return data;
}

// Déterminer si le Pokémon est en faiblesse selon la météo
function isPokemonWeak(pokemon, weather) {
  const mainWeather = weather.weather[0].main.toLowerCase();
  const temp = weather.main.temp;

  if (pokemon.type.toLowerCase() === 'feu' && mainWeather === 'rain') return true;
  if (pokemon.type.toLowerCase() === 'plante' && mainWeather === 'clouds') return true;
  if (pokemon.type.toLowerCase() === 'eau' && mainWeather === 'clear' && temp > 30) return true;

  return false;
}

// Récupérer tous les Pokémon
app.get('/pokemons', async (req, res) => {
  const pokemons = await prisma.pokemon.findMany();
  res.json(pokemons);
});

// Récupérer un Pokémon par ID
app.get('/pokemons/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const pokemon = await prisma.pokemon.findUnique({ where: { id } });
  pokemon ? res.json(pokemon) : res.status(404).json({ error: 'Pokémon non trouvé' });
});

// Ajouter un Pokémon
app.post('/pokemons', async (req, res) => {
  const { name, type, weak = false } = req.body;
  const newPokemon = await prisma.pokemon.create({
    data: { name, type, weak },
  });
  res.status(201).json(newPokemon);
});

// Modifier un Pokémon
app.patch('/pokemons/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, type, weak } = req.body;

  try {
    // Récupère le Pokémon existant
    const pokemon = await prisma.pokemon.findUnique({ where: { id } });
    if (!pokemon) return res.status(404).json({ error: 'Pokémon non trouvé' });

    // Met à jour uniquement les champs fournis
    const updatedPokemon = await prisma.pokemon.update({
      where: { id },
      data: {
        name: name ?? pokemon.name,
        type: type ?? pokemon.type,
        weak: weak ?? pokemon.weak
      },
    });

    res.json(updatedPokemon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un Pokémon
app.delete('/pokemons/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.pokemon.delete({ where: { id } });
    res.json({ message: 'Pokémon supprimé' });
  } catch {
    res.status(404).json({ error: 'Pokémon non trouvé' });
  }
});

app.get('/pokemons/:id/weather/:city', async (req, res) => {
  const id = parseInt(req.params.id);
  const city = req.params.city;

  try {
    const pokemon = await prisma.pokemon.findUnique({ where: { id } });
    if (!pokemon) return res.status(404).json({ error: 'Pokémon non trouvé' });

    const weather = await getWeather(city);
    const weak = isPokemonWeak(pokemon, weather);

    const message = weak
      ? `⚠️ Le Pokémon ${pokemon.name} est en faiblesse à cause du temps (${weather.weather[0].main.toLowerCase()}).`
      : `✅ Tout va bien pour ${pokemon.name}, le temps (${weather.weather[0].main.toLowerCase()}) ne l’affecte pas.`;

    res.json({
      ...pokemon,
      weak,
      weather: {
        city: weather.name,
        main: weather.weather[0].main,
        temp: weather.main.temp
      },
      message
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Serveur lancé sur http://localhost:3000'));
