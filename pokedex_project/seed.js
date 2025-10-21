const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.pokemon.createMany({
    data: [
      { name: "Pikachu", type: "Électrique", weak: false },
      { name: "Salamèche", type: "Feu", weak: false },
      { name: "Bulbizarre", type: "Plante", weak: false },
    ],
  });
  console.log("Seed terminé");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
