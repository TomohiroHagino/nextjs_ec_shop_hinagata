import { BaseCommand } from './base-command';

/**
 * 注文作成コマンド（CreateOrderCommand）
 * 
 * 役割:
 * - 新しい注文を作成するためのパラメータを定義
 * - カートの内容を注文に変換する操作を表現
 * 
 * 使用場面:
 * - POST /api/orders のリクエスト処理
 * - カートページから注文確定
 * - レジに進む操作
 * 
 * パラメータ:
 * - userId: ユーザーID（誰が注文するか）
 * - items: 注文アイテムの配列（OrderItemCommand[]）
 * 
 * バリデーション:
 * - userId が存在し、文字列であることを確認
 * - items が配列で、少なくとも1つのアイテムを含むことを確認
 * - 各アイテムの productId, quantity が正しいことを確認
 * - 不正なパラメータの場合はエラーを投げる
 * 
 * 注意点:
 * - 注文確定後はカートがクリアされる
 * - 注文時の価格が固定される（後で商品価格が変わっても影響なし）
 * - 在庫の確認と減算が行われる
 * - ユーザーがログインしている必要がある
 */
export class CreateOrderCommand extends BaseCommand {
  constructor(
    public readonly userId: string,
    public readonly items: OrderItemCommand[],
  ) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }

    if (!Array.isArray(this.items) || this.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    for (const item of this.items) {
      if (!item.productId || typeof item.productId !== 'string') {
        throw new Error('Product ID is required for each item');
      }

      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        throw new Error('Quantity must be a positive number for each item');
      }
    }
  }
}

/**
 * 注文アイテムコマンド（OrderItemCommand）
 * 
 * 役割:
 * - 注文に含まれる個別の商品情報を定義
 * - CreateOrderCommand の items 配列の要素として使用
 * 
 * 使用場面:
 * - CreateOrderCommand の items パラメータ
 * - カートアイテムから注文アイテムへの変換
 * 
 * パラメータ:
 * - productId: 商品ID（どの商品を注文するか）
 * - quantity: 数量（いくつ注文するか）
 * 
 * 注意点:
 * - 注文時の価格は CreateOrderCommand の処理で決定される
 * - 在庫確認は CreateOrderCommand の処理で行われる
 * - このクラス自体はバリデーションを行わない（CreateOrderCommand で実行）
 */
export class OrderItemCommand {
  constructor(
    public readonly productId: string,
    public readonly quantity: number,
  ) {}
}

/**
 * 注文キャンセルコマンド（CancelOrderCommand）
 * 
 * 役割:
 * - 既存の注文をキャンセルするためのパラメータを定義
 * - 注文の取り消し操作を表現
 * 
 * 使用場面:
 * - PUT /api/orders/:id/cancel のリクエスト処理
 * - 注文詳細ページでキャンセル
 * - ユーザーによる注文取り消し
 * 
 * パラメータ:
 * - userId: ユーザーID（誰がキャンセルするか）
 * - orderId: 注文ID（どの注文をキャンセルするか）
 * 
 * バリデーション:
 * - userId, orderId が存在し、文字列であることを確認
 * - 不正なパラメータの場合はエラーを投げる
 * 
 * 注意点:
 * - キャンセル可能なステータスのみ対象（PENDING, CONFIRMED）
 * - キャンセル後は在庫が戻される
 * - 注文の所有者のみキャンセル可能
 * - この操作は元に戻せない
 */
export class CancelOrderCommand extends BaseCommand {
  constructor(
    public readonly userId: string,
    public readonly orderId: string,
  ) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }

    if (!this.orderId || typeof this.orderId !== 'string') {
      throw new Error('Order ID is required');
    }
  }
}

/**
 * 注文ステータス更新コマンド（UpdateOrderStatusCommand）
 * 
 * 役割:
 * - 注文のステータスを変更するためのパラメータを定義
 * - 注文の進行状況を更新する操作を表現（管理者用）
 * 
 * 使用場面:
 * - PUT /api/orders/:id/status のリクエスト処理
 * - 管理者による注文ステータス更新
 * - 出荷、配送完了の更新
 * 
 * パラメータ:
 * - orderId: 注文ID（どの注文のステータスを更新するか）
 * - status: 新しいステータス（PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED）
 * 
 * バリデーション:
 * - orderId, status が存在し、文字列であることを確認
 * - status が有効な値であることを確認
 * - 不正なパラメータの場合はエラーを投げる
 * 
 * 注意点:
 * - 管理者権限が必要
 * - ステータスの遷移ルールに従う必要がある
 * - 配送完了時は在庫の最終確認が行われる
 * - この操作は注文の履歴として記録される
 */
export class UpdateOrderStatusCommand extends BaseCommand {
  constructor(
    public readonly orderId: string,
    public readonly status: string,
  ) {
    super();
  }

  validate(): void {
    if (!this.orderId || typeof this.orderId !== 'string') {
      throw new Error('Order ID is required');
    }

    if (!this.status || typeof this.status !== 'string') {
      throw new Error('Status is required');
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(this.status)) {
      throw new Error('Invalid order status');
    }
  }
}
