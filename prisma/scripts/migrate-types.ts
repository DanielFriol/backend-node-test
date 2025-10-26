import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateTypes() {
  console.log('Starting types migration...');

  const pokemons = await prisma.pokemon.findMany({});

  console.log(`Found ${pokemons.length} to migrate.`);

  const typeCache = new Map<string, number>();

  for (const pokemon of pokemons) {
    const pokemonTypeName = pokemon.type.toUpperCase();
    let typeId = typeCache.get(pokemonTypeName);

    if (!typeId) {
      console.log(
        `Type ${pokemon.type} is not cached, looking for it in database...`,
      );
      let type = await prisma.type.findUnique({
        where: {
          name: pokemonTypeName,
        },
      });

      if (!type) {
        console.log(`Type ${pokemon.type} not found, creating it...`);
        type = await prisma.type.create({
          data: { name: pokemonTypeName },
        });
        console.log(`Created type ${pokemon.type}.`);
      }
      typeId = type.id;
      console.log(`Caching in memory ${type.name} (ID: ${type.id}).`);
      typeCache.set(pokemonTypeName, typeId);
    }

    await prisma.pokemon.update({
      where: { id: pokemon.id },
      data: {
        types: {
          connect: {
            id: typeId,
          },
        },
      },
    });
    console.log(
      `Migrated pokemon ${pokemon.name} for type ${pokemon.type} (ID: ${pokemon.id}).`,
    );
  }
}

migrateTypes()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
