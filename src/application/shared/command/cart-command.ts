import { BaseCommand } from './base-command';

/**
 * カートアイテム追加コマンド（AddToCartCommand）
 * 
 * 役割:
 * - カートに商品を追加するためのパラメータを定義
 * - 商品の数量を指定してカートに追加する操作を表現
 * 
 * 使用場面:
 * - POST /api/cart のリクエスト処理
 * - 商品詳細ページからカートに追加
 * - 商品一覧ページからカートに追加
 * 
 * パラメータ:
 * - userId: ユーザーID（誰のカートに追加するか）
 * - productId: 商品ID（どの商品を追加するか）
 * - quantity: 数量（いくつ追加するか）
 * 
 * バリデーション:
 * - userId, productId が存在し、文字列であることを確認
 * - quantity が正の数であることを確認
 * - 不正なパラメータの場合はエラーを投げる
 * 
 * 注意点:
 * - 既に同じ商品がカートにある場合は数量を加算
 * - 在庫切れの場合はエラーを返す
 * - ユーザーがログインしている必要がある
 */
export class AddToCartCommand extends BaseCommand {
  constructor(
    public readonly userId: string,
    public readonly productId: string,
    public readonly quantity: number,
  ) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }

    if (!this.productId || typeof this.productId !== 'string') {
      throw new Error('Product ID is required');
    }

    if (typeof this.quantity !== 'number' || this.quantity <= 0) {
      throw new Error('Quantity must be a positive number');
    }
  }
}

/**
 * カートアイテム削除コマンド（RemoveFromCartCommand）
 * 
 * 役割:
 * - カートから特定のアイテムを削除するためのパラメータを定義
 * - カート内の不要な商品を削除する操作を表現
 * 
 * 使用場面:
 * - DELETE /api/cart/:itemId のリクエスト処理
 * - カートページでアイテムを削除
 * - 商品を完全にカートから除去
 * 
 * パラメータ:
 * - userId: ユーザーID（誰のカートから削除するか）
 * - itemId: カートアイテムID（どのアイテムを削除するか）
 * 
 * バリデーション:
 * - userId, itemId が存在し、文字列であることを確認
 * - 不正なパラメータの場合はエラーを投げる
 * 
 * 注意点:
 * - アイテムが存在しない場合はエラーを返す
 * - ユーザーがログインしている必要がある
 * - 削除後はカートの合計金額が再計算される
 */
export class RemoveFromCartCommand extends BaseCommand {
  constructor(
    public readonly userId: string,
    public readonly itemId: string,
  ) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }

    if (!this.itemId || typeof this.itemId !== 'string') {
      throw new Error('Item ID is required');
    }
  }
}

/**
 * カートアイテム数量更新コマンド（UpdateCartItemCommand）
 * 
 * 役割:
 * - カート内の特定アイテムの数量を変更するためのパラメータを定義
 * - 商品の購入数量を調整する操作を表現
 * 
 * 使用場面:
 * - PUT /api/cart/:itemId のリクエスト処理
 * - カートページで数量を変更
 * - 商品の購入数を増減
 * 
 * パラメータ:
 * - userId: ユーザーID（誰のカートを更新するか）
 * - itemId: カートアイテムID（どのアイテムの数量を変更するか）
 * - quantity: 新しい数量（いくつに変更するか）
 * 
 * バリデーション:
 * - userId, itemId が存在し、文字列であることを確認
 * - quantity が正の数であることを確認
 * - 不正なパラメータの場合はエラーを投げる
 * 
 * 注意点:
 * - アイテムが存在しない場合はエラーを返す
 * - 在庫数を超える場合はエラーを返す
 * - ユーザーがログインしている必要がある
 * - 更新後はカートの合計金額が再計算される
 */
export class UpdateCartItemCommand extends BaseCommand {
  constructor(
    public readonly userId: string,
    public readonly itemId: string,
    public readonly quantity: number,
  ) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }

    if (!this.itemId || typeof this.itemId !== 'string') {
      throw new Error('Item ID is required');
    }

    if (typeof this.quantity !== 'number' || this.quantity <= 0) {
      throw new Error('Quantity must be a positive number');
    }
  }
}

/**
 * カートクリアコマンド（ClearCartCommand）
 * 
 * 役割:
 * - カート内のすべてのアイテムを削除するためのパラメータを定義
 * - カートを空にする操作を表現
 * 
 * 使用場面:
 * - DELETE /api/cart のリクエスト処理
 * - 注文確定後のカートクリア
 * - ユーザーがカートをリセット
 * - 管理者によるカートクリア
 * 
 * パラメータ:
 * - userId: ユーザーID（誰のカートをクリアするか）
 * 
 * バリデーション:
 * - userId が存在し、文字列であることを確認
 * - 不正なパラメータの場合はエラーを投げる
 * 
 * 注意点:
 * - カートが空の場合でもエラーにならない
 * - ユーザーがログインしている必要がある
 * - 削除後はカートの合計金額が0になる
 * - この操作は元に戻せない（慎重に使用）
 */
export class ClearCartCommand extends BaseCommand {
  constructor(public readonly userId: string) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }
  }
}
