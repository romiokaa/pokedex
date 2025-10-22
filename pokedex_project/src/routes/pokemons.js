const express = require('express');
const router = express.Router();
const pokemonService = require('../services/pokemonService');

router.get('/', async (req, res) => {
  const pokemons = await pokemonService.getAllPokemons();
  res.json(pokemons);
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const pokemon = await pokemonService.getPokemonById(id);
  pokemon ? res.json(pokemon) : res.status(404).json({ error: 'Pokémon non trouvé' });
});

router.post('/', async (req, res) => {
  const newPokemon = await pokemonService.createPokemon(req.body);
  res.status(201).json(newPokemon);
});

router.patch('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const updatedPokemon = await pokemonService.updatePokemon(id, req.body);
  updatedPokemon
    ? res.json(updatedPokemon)
    : res.status(404).json({ error: 'Pokémon non trouvé' });
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await pokemonService.deletePokemon(id);
    res.json({ message: 'Pokémon supprimé' });
  } catch {
    res.status(404).json({ error: 'Pokémon non trouvé' });
  }
});

module.exports = router;
