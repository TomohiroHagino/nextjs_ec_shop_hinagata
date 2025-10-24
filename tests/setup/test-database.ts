import { PrismaClient } from '@prisma/client';

// テスト用のPrismaクライアント
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db',
    },
  },
});

// テストデータベースのセットアップ
export async function setupTestDatabase() {
  try {
    // テストデータベースをクリア
    await testPrisma.cartItem.deleteMany();
    await testPrisma.cart.deleteMany();
    await testPrisma.orderItem.deleteMany();
    await testPrisma.order.deleteMany();
    await testPrisma.product.deleteMany();
    await testPrisma.user.deleteMany();

    // テストデータを作成
    await testPrisma.user.create({
      data: {
        id: 'test-user-1',
        email: 'test@example.com',
        password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJByJpD6h1z8K5K5K5K', // password123
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await testPrisma.product.createMany({
      data: [
        {
          id: 'test-product-1',
          name: 'Test Product 1',
          description: 'Test Description 1',
          price: 1000,
          stock: 10,
          imageUrl: 'https://example.com/image1.jpg',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'test-product-2',
          name: 'Test Product 2',
          description: 'Test Description 2',
          price: 2000,
          stock: 5,
          imageUrl: 'https://example.com/image2.jpg',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });
  } catch (error) {
    console.error('Test database setup error:', error);
    // エラーが発生してもテストを続行
  }
}

// テストデータベースのクリーンアップ
export async function cleanupTestDatabase() {
  try {
    await testPrisma.$disconnect();
  } catch (error) {
    console.error('Test database cleanup error:', error);
  }
}