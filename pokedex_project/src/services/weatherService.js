const axios = require('axios');
const redisClient = require('../cache/redisClient');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

async function getWeather(city) {
  const cached = await redisClient.get(city);
  if (cached) return JSON.parse(cached);

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;
  const response = await axios.get(url);
  const data = response.data;

  await redisClient.setEx(city, 600, JSON.stringify(data));
  return data;
}

function isPokemonWeak(pokemon, weather) {
  const mainWeather = weather.weather[0].main.toLowerCase();
  const temp = weather.main.temp;

  if (pokemon.type.toLowerCase() === 'feu' && mainWeather === 'rain') return true;
  if (pokemon.type.toLowerCase() === 'plante' && mainWeather === 'clouds') return true;
  if (pokemon.type.toLowerCase() === 'eau' && mainWeather === 'clear' && temp > 30) return true;

  return false;
}

module.exports = { getWeather, isPokemonWeak };
