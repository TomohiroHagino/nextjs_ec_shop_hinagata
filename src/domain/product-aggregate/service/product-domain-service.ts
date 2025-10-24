import { Product } from '../entity';
import { ProductId } from '../value-object';
import { ProductRepository } from '../repository';
import { ValidationException } from '@/domain/shared/exception';

/**
 * プロダクトドメインサービス
 */
export class ProductDomainService {
  constructor(private readonly productRepository: ProductRepository) {}

  /**
   * プロダクト存在確認
   */
  async ensureProductExists(productId: ProductId): Promise<Product> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new ValidationException('Product not found');
    }
    return product;
  }

  /**
   * アクティブなプロダクト存在確認
   */
  async ensureActiveProductExists(productId: ProductId): Promise<Product> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new ValidationException('Product not found');
    }

    if (!product.isActive) {
      throw new ValidationException('Product is not active');
    }

    return product;
  }

  /**
   * 在庫確認
   */
  async ensureStockAvailable(productId: ProductId, quantity: number): Promise<Product> {
    const product = await this.ensureActiveProductExists(productId);

    if (!product.hasStock(quantity)) {
      throw new ValidationException('Insufficient stock');
    }

    return product;
  }

  /**
   * プロダクト名の重複チェック
   */
  async validateProductNameUniqueness(name: string, excludeId?: ProductId): Promise<void> {
    const existingProducts = await this.productRepository.findByName(name);
    
    if (excludeId) {
      const filteredProducts = existingProducts.filter(p => !p.id.equals(excludeId));
      if (filteredProducts.length > 0) {
        throw new ValidationException('Product name already exists');
      }
    } else {
      if (existingProducts.length > 0) {
        throw new ValidationException('Product name already exists');
      }
    }
  }
}
