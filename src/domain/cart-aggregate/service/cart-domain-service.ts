import { Cart, CartItem } from '../entity';
import { CartId, CartItemId, Quantity } from '../value-object';
import { UserId } from '@/domain/user-aggregate/value-object';
import { ProductId } from '@/domain/product-aggregate/value-object';
import { CartRepository } from '../repository';
import { ValidationException } from '@/domain/shared/exception';
import { v4 as uuidv4 } from 'uuid';

/**
 * カートドメインサービス
 */
export class CartDomainService {
  constructor(private readonly cartRepository: CartRepository) {}

  /**
   * カート存在確認
   */
  async ensureCartExists(cartId: CartId): Promise<Cart> {
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) {
      throw new ValidationException('Cart not found');
    }
    return cart;
  }

  /**
   * ユーザーのカート取得または作成
   */
  async getOrCreateUserCart(userId: UserId): Promise<Cart> {
    let cart = await this.cartRepository.findByUserId(userId);
    
    if (!cart) {
      // カートが存在しない場合は新規作成（UUIDを使用）
      const cartId = new CartId(uuidv4());
      cart = Cart.create(cartId, userId);
      await this.cartRepository.save(cart);
    }
    
    return cart;
  }

  /**
   * カートアイテム追加の検証
   */
  async validateAddItem(
    userId: UserId,
    productId: ProductId,
    quantity: Quantity,
  ): Promise<void> {
    // カートの存在確認
    await this.getOrCreateUserCart(userId);

    // 数量の検証
    if (quantity.value <= 0) {
      throw new ValidationException('Quantity must be positive');
    }

    if (quantity.value > 99) {
      throw new ValidationException('Quantity cannot exceed 99');
    }
  }

  /**
   * カートアイテム更新の検証
   */
  async validateUpdateItem(
    userId: UserId,
    itemId: string,
    newQuantity: Quantity,
  ): Promise<void> {
    const cart = await this.getOrCreateUserCart(userId);
    
    if (!cart.hasItem(itemId)) {
      throw new ValidationException('Cart item not found');
    }

    if (newQuantity.value <= 0) {
      throw new ValidationException('Quantity must be positive');
    }

    if (newQuantity.value > 99) {
      throw new ValidationException('Quantity cannot exceed 99');
    }
  }

  /**
   * カートアイテム削除の検証
   */
  async validateRemoveItem(userId: UserId, itemId: string): Promise<void> {
    const cart = await this.getOrCreateUserCart(userId);
    
    if (!cart.hasItem(itemId)) {
      throw new ValidationException('Cart item not found');
    }
  }
}
