const prisma = require('../db/prismaClient');

async function getAllPokemons() {
  return prisma.pokemon.findMany();
}

async function getPokemonById(id) {
  return prisma.pokemon.findUnique({ where: { id } });
}

async function createPokemon(data) {
  return prisma.pokemon.create({ data });
}

async function updatePokemon(id, data) {
  const pokemon = await prisma.pokemon.findUnique({ where: { id } });
  if (!pokemon) return null;

  return prisma.pokemon.update({
    where: { id },
    data: {
      name: data.name ?? pokemon.name,
      type: data.type ?? pokemon.type,
      weak: data.weak ?? pokemon.weak,
    },
  });
}

async function deletePokemon(id) {
  return prisma.pokemon.delete({ where: { id } });
}

module.exports = { getAllPokemons, getPokemonById, createPokemon, updatePokemon, deletePokemon };
