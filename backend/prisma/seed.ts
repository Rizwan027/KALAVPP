import { PrismaClient, UserRole, CategoryType, ProductType, ServiceType } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await hashPassword('Admin@123456');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kalavpp.com' },
    update: {},
    create: {
      email: 'admin@kalavpp.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  });
  console.log('✅ Admin user created');

  // Create vendor user
  const vendorPassword = await hashPassword('Vendor@123456');
  const vendor = await prisma.user.upsert({
    where: { email: 'vendor@kalavpp.com' },
    update: {},
    create: {
      email: 'vendor@kalavpp.com',
      passwordHash: vendorPassword,
      name: 'Demo Vendor',
      role: UserRole.VENDOR,
    },
  });

  // Create vendor profile
  const vendorProfile = await prisma.vendorProfile.upsert({
    where: { userId: vendor.id },
    update: {},
    create: {
      userId: vendor.id,
      businessName: 'Artisan Studio',
      businessDescription: 'Professional digital art and custom commissions',
      approvalStatus: 'APPROVED',
    },
  });
  console.log('✅ Vendor user and profile created');

  // Create categories
  const artCategory = await prisma.category.upsert({
    where: { slug: 'digital-art' },
    update: {},
    create: {
      name: 'Digital Art',
      slug: 'digital-art',
      type: CategoryType.PRODUCT,
      description: 'Digital artwork and illustrations',
    },
  });

  const printCategory = await prisma.category.upsert({
    where: { slug: 'prints' },
    update: {},
    create: {
      name: 'Prints',
      slug: 'prints',
      type: CategoryType.PRODUCT,
      description: 'Physical prints and posters',
    },
  });

  const commissionCategory = await prisma.category.upsert({
    where: { slug: 'commissions' },
    update: {},
    create: {
      name: 'Commissions',
      slug: 'commissions',
      type: CategoryType.SERVICE,
      description: 'Custom artwork commissions',
    },
  });

  const workshopCategory = await prisma.category.upsert({
    where: { slug: 'workshops' },
    update: {},
    create: {
      name: 'Workshops',
      slug: 'workshops',
      type: CategoryType.SERVICE,
      description: 'Art workshops and classes',
    },
  });
  console.log('✅ Categories created');

  // Create sample products
  const products = [
    {
      title: 'Abstract Digital Artwork #1',
      slug: 'abstract-digital-artwork-1',
      description: 'Beautiful abstract digital artwork perfect for your home or office. High resolution digital download.',
      price: 29.99,
      type: ProductType.DIGITAL,
      categoryId: artCategory.id,
      stockQuantity: 999,
      tags: ['abstract', 'digital', 'modern'],
    },
    {
      title: 'Nature Landscape Print',
      slug: 'nature-landscape-print',
      description: 'Stunning nature landscape photography print. Professionally printed on premium paper.',
      price: 49.99,
      type: ProductType.PHYSICAL,
      categoryId: printCategory.id,
      stockQuantity: 25,
      tags: ['nature', 'landscape', 'photography'],
    },
    {
      title: 'Modern Portrait Digital Art',
      slug: 'modern-portrait-digital-art',
      description: 'Contemporary digital portrait art. Instant download in high resolution.',
      price: 39.99,
      type: ProductType.DIGITAL,
      categoryId: artCategory.id,
      stockQuantity: 999,
      tags: ['portrait', 'digital', 'modern'],
    },
    {
      title: 'Abstract Canvas Print',
      slug: 'abstract-canvas-print',
      description: 'Large abstract canvas print ready to hang. Museum quality.',
      price: 149.99,
      type: ProductType.PHYSICAL,
      categoryId: printCategory.id,
      stockQuantity: 10,
      tags: ['abstract', 'canvas', 'large'],
    },
  ];

  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: {
        ...productData,
        vendorId: vendorProfile.id,
        isActive: true,
      },
    });

    // Add sample image for each product
    const existingImage = await prisma.productImage.findFirst({
      where: { productId: product.id },
    });

    if (!existingImage) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: `https://picsum.photos/seed/${product.slug}/800/600`,
          imageUrl: `https://picsum.photos/seed/${product.slug}/800/600`,
          displayOrder: 0,
        },
      });
    }
  }
  console.log('✅ Sample products created with images');

  // Create sample services
  const services = [
    {
      title: 'Custom Character Commission',
      slug: 'custom-character-commission',
      description: 'Get a custom character illustration created just for you. Includes 3 revisions.',
      price: 199.99,
      serviceType: ServiceType.COMMISSION,
      categoryId: commissionCategory.id,
      deliveryTime: '7-10 days',
      tags: ['commission', 'character', 'custom'],
    },
    {
      title: 'Digital Painting Workshop',
      slug: 'digital-painting-workshop',
      description: 'Learn digital painting techniques in this 4-week online workshop.',
      price: 299.99,
      serviceType: ServiceType.WORKSHOP,
      categoryId: workshopCategory.id,
      duration: 240,
      capacity: 20,
      tags: ['workshop', 'painting', 'online'],
    },
    {
      title: 'Portrait Commission',
      slug: 'portrait-commission',
      description: 'Professional digital portrait commission. Perfect for gifts or personal use.',
      price: 149.99,
      serviceType: ServiceType.COMMISSION,
      categoryId: commissionCategory.id,
      deliveryTime: '5-7 days',
      tags: ['commission', 'portrait', 'digital'],
    },
  ];

  for (const serviceData of services) {
    const service = await prisma.service.upsert({
      where: { slug: serviceData.slug },
      update: {},
      create: {
        ...serviceData,
        vendorId: vendorProfile.id,
        isActive: true,
      },
    });

    // Add sample image for each service
    const existingImage = await prisma.serviceImage.findFirst({
      where: { serviceId: service.id },
    });

    if (!existingImage) {
      await prisma.serviceImage.create({
        data: {
          serviceId: service.id,
          url: `https://picsum.photos/seed/${service.slug}/800/600`,
          imageUrl: `https://picsum.photos/seed/${service.slug}/800/600`,
          displayOrder: 0,
        },
      });
    }
  }
  console.log('✅ Sample services created with images');

  console.log('🎉 Database seeding completed!');
  console.log('\n📝 Login Credentials:');
  console.log('Admin: admin@kalavpp.com / Admin@123456');
  console.log('Vendor: vendor@kalavpp.com / Vendor@123456');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
