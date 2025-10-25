/**
 * 基底クエリクラス
 * 
 * Query（クエリ）とは？
 * - データを「読み取る」ためのリクエスト情報を表すクラス
 * - CQRS（Command Query Responsibility Segregation）パターンの「Query」部分
 * - データの変更は行わず、取得のみを行う
 * 
 * なぜQueryが必要？
 * 1. 型安全性: パラメータの型を明確に定義
 * 2. バリデーション: 不正なパラメータを事前にチェック
 * 3. 可読性: 何を取得したいかが明確
 * 4. テスタビリティ: クエリの内容をテストしやすい
 * 
 * 使用例:
 * - GetCartQuery: ユーザーのカートを取得
 * - GetOrderQuery: 特定の注文を取得
 * - GetOrdersQuery: ユーザーの注文一覧を取得
 * 
 * 設計原則:
 * - データの変更は行わない（読み取り専用）
 * - パラメータの検証を行う
 * - 不変（immutable）である
 */
export abstract class BaseQuery {
  abstract validate(): void;
}
