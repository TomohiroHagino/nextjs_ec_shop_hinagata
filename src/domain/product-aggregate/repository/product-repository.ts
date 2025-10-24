import { Product } from '../entity';
import { ProductId } from '../value-object';

/**
 * プロダクトリポジトリインターフェース
 */
export interface ProductRepository {
  /**
   * IDでプロダクトを取得
   */
  findById(id: ProductId): Promise<Product | null>;

  /**
   * 全てのプロダクトを取得
   */
  findAll(): Promise<Product[]>;

  /**
   * アクティブなプロダクトを取得
   */
  findActive(): Promise<Product[]>;

  /**
   * プロダクトを保存
   */
  save(product: Product): Promise<void>;

  /**
   * プロダクトを削除
   */
  delete(id: ProductId): Promise<void>;

  /**
   * プロダクト名で検索
   */
  findByName(name: string): Promise<Product[]>;

  /**
   * 価格範囲で検索
   */
  findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]>;
}
