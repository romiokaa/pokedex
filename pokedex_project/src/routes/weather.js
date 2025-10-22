const express = require('express');
const router = express.Router();
const pokemonService = require('../services/pokemonService');
const { getWeather, isPokemonWeak } = require('../services/weatherService');

router.get('/:id/weather/:city', async (req, res) => {
  const id = parseInt(req.params.id);
  const city = req.params.city;

  const pokemon = await pokemonService.getPokemonById(id);
  if (!pokemon) return res.status(404).json({ error: 'Pokémon non trouvé' });

  const weather = await getWeather(city);
  const weak = isPokemonWeak(pokemon, weather);

  const message = weak
    ? `⚠️ Le Pokémon ${pokemon.name} est en faiblesse à cause du temps (${weather.weather[0].main.toLowerCase()}).`
    : `✅ Tout va bien pour ${pokemon.name}, le temps (${weather.weather[0].main.toLowerCase()}) ne l’affecte pas.`;

  res.json({ ...pokemon, weak, weather: { city: weather.name, main: weather.weather[0].main, temp: weather.main.temp }, message });
});

module.exports = router;
