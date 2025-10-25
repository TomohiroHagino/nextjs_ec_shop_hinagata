import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 シードデータを作成中...');

  // テストユーザーを作成
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      id: 'user-1',
      email: 'demo@example.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
    },
  });

  // 統合テスト用ユーザーを作成
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: 'test-user-1',
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
    },
  });

  console.log('✅ ユーザーを作成しました:', demoUser.email, testUser.email);

  // テスト商品を作成（価格は円単位の整数で保存）
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 'product-1' },
      update: {},
      create: {
        id: 'product-1',
        name: 'MacBook Pro 16インチ',
        description: '最新のM3チップを搭載したMacBook Pro 16インチ。高性能なプロセッサと美しいRetinaディスプレイを備えています。',
        price: 298000, // 298,000円
        stock: 10,
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: 'product-2' },
      update: {},
      create: {
        id: 'product-2',
        name: 'iPhone 15 Pro',
        description: 'チタニウムボディとA17 Proチップを搭載したiPhone 15 Pro。プロレベルのカメラシステムを内蔵しています。',
        price: 134800, // 134,800円
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: 'product-3' },
      update: {},
      create: {
        id: 'product-3',
        name: 'AirPods Pro (第2世代)',
        description: 'アクティブノイズキャンセリング機能を搭載したAirPods Pro。没入感のある音楽体験を提供します。',
        price: 39800, // 39,800円
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400',
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: 'product-4' },
      update: {},
      create: {
        id: 'product-4',
        name: 'iPad Air (第5世代)',
        description: 'M1チップを搭載したiPad Air。クリエイティブな作業やエンターテイメントに最適です。',
        price: 79800, // 79,800円
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: 'product-5' },
      update: {},
      create: {
        id: 'product-5',
        name: 'Apple Watch Series 9',
        description: '健康管理とフィットネストラッキングに最適なApple Watch Series 9。常時表示ディスプレイを搭載。',
        price: 59800, // 59,800円
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ 商品を作成しました:', products.length, '件');

  console.log('🎉 シードデータの作成が完了しました！');
}

main()
  .catch((e) => {
    console.error('❌ シードデータの作成に失敗しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
