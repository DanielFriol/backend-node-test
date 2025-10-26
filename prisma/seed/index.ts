import prisma from './prisma.client';
import { pokemons } from './data/pokemon';
import { types } from './data/type';

async function main() {
  await prisma.type.deleteMany();
  await prisma.type.createMany({
    data: types,
  });
  await prisma.pokemon.deleteMany();
  for (const pokemon of pokemons) {
    await prisma.pokemon.create({
      data: {
        name: pokemon.name,
        id: pokemon.id,
        types: {
          connect: {
            name: pokemon.type,
          },
        },
      },
    });
  }
}

main()
  .catch((error) => {
    console.error('Error seeding the database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Seeding completed successfully');
  });
