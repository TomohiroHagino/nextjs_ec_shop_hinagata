import { Cart, CartItem } from '../entity';
import { CartId } from '../value-object';
import { UserId } from '@/domain/user-aggregate/value-object';
import { ProductId } from '@/domain/product-aggregate/value-object';

/**
 * カートリポジトリインターフェース
 */
export interface CartRepository {
  /**
   * IDでカートを取得
   */
  findById(id: CartId): Promise<Cart | null>;

  /**
   * ユーザーIDでカートを取得
   */
  findByUserId(userId: UserId): Promise<Cart | null>;

  /**
   * カートを保存
   */
  save(cart: Cart): Promise<void>;

  /**
   * カートを削除
   */
  delete(id: CartId): Promise<void>;

  /**
   * カートアイテムを保存
   */
  saveItem(item: CartItem): Promise<void>;

  /**
   * カートアイテムを削除
   */
  deleteItem(itemId: string): Promise<void>;

  /**
   * ユーザーのカートアイテムを取得
   */
  findItemsByUserId(userId: UserId): Promise<CartItem[]>;
}
