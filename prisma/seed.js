const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const courts = [
    { name: 'Bane 1' },
    { name: 'Bane 2' },
    { name: 'Bane 3' },
  ]

  for (const court of courts) {
    const existing = await prisma.court.findFirst({
      where: { name: court.name }
    })
    if (!existing) {
      await prisma.court.create({
        data: court,
      })
    }
  }

  console.log('Seed data inserted')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
