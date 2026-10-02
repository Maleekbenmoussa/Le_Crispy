import { PrismaClient } from '@prisma/client';
import { CATEGORIES, MOCK_MENU, MOCK_REVIEWS, MOCK_RECLAMATIONS } from '../src/data/mockData';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PostgreSQL database "leCrispy"...');

  // Seed Categories
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: {
        id: cat.id,
        nameFr: cat.name.fr,
        nameAr: cat.name.ar,
        nameEn: cat.name.en,
        icon: cat.icon
      }
    });
  }

  // Seed Menu Items
  for (const item of MOCK_MENU) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        nameFr: item.name.fr,
        nameAr: item.name.ar,
        nameEn: item.name.en,
        descFr: item.description.fr,
        descAr: item.description.ar,
        descEn: item.description.en,
        price: item.price,
        category: item.category,
        image: item.image,
        spiceLevel: item.spiceLevel,
        isHealthy: item.isHealthy,
        isPopular: item.isPopular || false,
        isNew: item.isNew || false,
        preparationTimeMinutes: item.preparationTimeMinutes,
        calories: item.nutrition?.calories,
        protein: item.nutrition?.protein,
        carbs: item.nutrition?.carbs,
        fat: item.nutrition?.fat,
        dietTags: item.dietTags || []
      }
    });
  }

  // Seed Reviews (only if table empty)
  const reviewCount = await prisma.review.count();
  if (reviewCount === 0) {
    for (const rev of MOCK_REVIEWS) {
      await prisma.review.create({
        data: {
          userName: rev.userName,
          userAvatar: rev.userAvatar,
          rating: rev.rating,
          comment: rev.comment,
          isApproved: rev.isApproved,
          reply: rev.reply
        }
      });
    }
  }

  // Seed Reclamations (only if table empty)
  const recCount = await prisma.reclamation.count();
  if (recCount === 0) {
    for (const rec of MOCK_RECLAMATIONS) {
      await prisma.reclamation.create({
        data: {
          orderId: rec.orderId,
          userName: rec.userName,
          userEmail: rec.userEmail,
          userPhone: rec.userPhone,
          subject: rec.subject,
          description: rec.description,
          status: rec.status,
          adminNote: rec.adminNote
        }
      });
    }
  }

  // Seed Default Users
  await prisma.user.upsert({
    where: { email: 'malekmoussa0710@gmail.com' },
    update: {
      name: 'ben moussa malek',
      phone: '+216 27 500 246',
      role: 'admin'
    },
    create: {
      email: 'malekmoussa0710@gmail.com',
      name: 'ben moussa malek',
      phone: '+216 27 500 246',
      role: 'admin',
      addresses: {
        create: {
          title: 'Résidence Principale',
          street: '1 rue Jean de Dormans',
          city: 'Dormans',
          zipCode: '51700',
          phone: '+216 27 500 246',
          isDefault: true
        }
      }
    }
  });

  await prisma.user.upsert({
    where: { email: 'ines.caisse@lecrispy.com' },
    update: {
      name: 'Ines Triki (Caisse)',
      phone: '+33 6 55 88 99 00',
      role: 'cashier'
    },
    create: {
      email: 'ines.caisse@lecrispy.com',
      name: 'Ines Triki (Caisse)',
      phone: '+33 6 55 88 99 00',
      role: 'cashier',
      addresses: {
        create: {
          title: 'Restaurant Le Crispy',
          street: '1 rue Jean de Dormans',
          city: 'Dormans',
          zipCode: '51700',
          phone: '+33 6 55 88 99 00',
          isDefault: true
        }
      }
    }
  });

  await prisma.user.upsert({
    where: { email: 'client@lecrispy.fr' },
    update: {
      name: 'Client Fidèle',
      phone: '+33 6 12 34 56 78',
      role: 'customer'
    },
    create: {
      email: 'client@lecrispy.fr',
      name: 'Client Fidèle',
      phone: '+33 6 12 34 56 78',
      role: 'customer',
      addresses: {
        create: {
          title: 'Domicile',
          street: '12 rue de la Paix',
          city: 'Dormans',
          zipCode: '51700',
          phone: '+33 6 12 34 56 78',
          isDefault: true
        }
      }
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
