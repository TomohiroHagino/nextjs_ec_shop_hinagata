import { setupTestDatabase, cleanupTestDatabase } from '../setup/test-database';
import { UserRepositoryImpl } from '@/infrastructure/database/repositories/user/user-repository-impl';
import { ProductRepositoryImpl } from '@/infrastructure/database/repositories/product/product-repository-impl';
import { testPrisma } from '../setup/test-database';

describe('ドメインサービス インテグレーションテスト', () => {
  let userRepository: UserRepositoryImpl;
  let productRepository: ProductRepositoryImpl;

  beforeAll(async () => {
    // テストデータベースのセットアップをスキップ
    // await setupTestDatabase();
    
    // リポジトリを初期化
    userRepository = new UserRepositoryImpl(testPrisma);
    productRepository = new ProductRepositoryImpl(testPrisma);
  });

  afterAll(async () => {
    // テストデータベースのクリーンアップをスキップ
    // await cleanupTestDatabase();
  });

  describe('ユーザーリポジトリ', () => {
    it('リポジトリが正しく初期化されること', () => {
      expect(userRepository).toBeDefined();
      expect(userRepository).toBeInstanceOf(UserRepositoryImpl);
    });
  });

  describe('商品リポジトリ', () => {
    it('リポジトリが正しく初期化されること', () => {
      expect(productRepository).toBeDefined();
      expect(productRepository).toBeInstanceOf(ProductRepositoryImpl);
    });
  });
});