/**
 * 基底コマンドクラス
 * 
 * Command（コマンド）とは？
 * - データを「変更する」ためのリクエスト情報を表すクラス
 * - CQRS（Command Query Responsibility Segregation）パターンの「Command」部分
 * - データの作成、更新、削除などの操作を表現
 * 
 * なぜCommandが必要？
 * 1. 型安全性: パラメータの型を明確に定義
 * 2. バリデーション: 不正なパラメータを事前にチェック
 * 3. 可読性: 何を変更したいかが明確
 * 4. テスタビリティ: コマンドの内容をテストしやすい
 * 5. 不変性: 作成後に変更できない（immutable）
 * 
 * 使用例:
 * - AddToCartCommand: カートに商品を追加
 * - CreateOrderCommand: 新しい注文を作成
 * - UpdateUserProfileCommand: ユーザープロフィールを更新
 * 
 * 設計原則:
 * - データの変更を表現する
 * - パラメータの検証を行う
 * - 不変（immutable）である
 * - ビジネスロジックは含まない（データのみ）
 */
export abstract class BaseCommand {
  abstract validate(): void;
}
