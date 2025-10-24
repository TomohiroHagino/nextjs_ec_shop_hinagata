import { Order, OrderItem } from '../entity';
import { OrderId } from '../value-object';
import { UserId } from '@/domain/user-aggregate/value-object';

/**
 * オーダーリポジトリインターフェース
 */
export interface OrderRepository {
  /**
   * IDでオーダーを取得
   */
  findById(id: OrderId): Promise<Order | null>;

  /**
   * ユーザーIDでオーダー一覧を取得
   */
  findByUserId(userId: UserId): Promise<Order[]>;

  /**
   * ステータスでオーダー一覧を取得
   */
  findByStatus(status: string): Promise<Order[]>;

  /**
   * オーダーを保存
   */
  save(order: Order): Promise<void>;

  /**
   * オーダーを削除
   */
  delete(id: OrderId): Promise<void>;

  /**
   * オーダーアイテムを保存
   */
  saveItem(item: OrderItem): Promise<void>;

  /**
   * オーダーアイテムを削除
   */
  deleteItem(itemId: string): Promise<void>;

  /**
   * ユーザーのオーダー数を取得
   */
  countByUserId(userId: UserId): Promise<number>;
}
