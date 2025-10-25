/**
 * 基底DTOクラス
 * 
 * DTO (Data Transfer Object) とは？
 * - データを「運ぶための入れ物」
 * - ドメイン層からプレゼンテーション層（API、UI）へデータを渡すときに使う
 * - ドメインエンティティを直接公開せず、必要な情報だけを渡す
 * 
 * なぜDTOが必要？
 * 1. セキュリティ: パスワードなどの機密情報を隠せる
 * 2. 安定性: ドメインモデルが変わっても、APIの形式を維持できる
 * 3. 最適化: 不要な情報を除外し、必要な情報だけを送る
 * 
 * 使用例:
 * - ドメイン: User エンティティ（ビジネスロジック込み）
 * - DTO: UserDto（データだけ、ロジックなし）
 * - API: UserDto を JSON に変換して返す
 */
export abstract class BaseDto {
  abstract toJSON(): Record<string, any>;
}
