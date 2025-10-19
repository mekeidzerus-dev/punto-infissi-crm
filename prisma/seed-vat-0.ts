import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Adding VAT 0%...')

  // Проверяем, есть ли уже НДС 0%
  const existing = await prisma.vATRate.findFirst({
    where: { percentage: 0 }
  })

  if (existing) {
    console.log('✅ VAT 0% already exists')
    return
  }

  // Добавляем НДС 0%
  const vat0 = await prisma.vATRate.create({
    data: {
      name: 'IVA 0%',
      percentage: 0,
      description: 'Без НДС / Esente IVA',
      isDefault: false,
      isActive: true
    }
  })

  console.log('✅ Created VAT 0%:', vat0)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
