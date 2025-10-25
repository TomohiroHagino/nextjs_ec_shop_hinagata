import { BaseDto } from './base-dto';

/**
 * ユーザーDTO（Data Transfer Object）
 * 
 * 役割:
 * - User エンティティから必要な情報だけを取り出して、API や UI に渡す
 * - パスワードなどの機密情報は含まない（セキュリティ）
 * 
 * 使用場面:
 * - GET /api/users/profile のレスポンス
 * - ログイン後のユーザー情報
 * - プロフィール画面の表示
 * 
 * 含まれる情報:
 * - id: ユーザーID
 * - email: メールアドレス
 * - firstName, lastName: 名前
 * - createdAt, updatedAt: 作成・更新日時
 * 
 * 含まれない情報:
 * - password: セキュリティのため絶対に含めない
 * - その他の内部情報
 */
export class UserDto extends BaseDto {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {
    super();
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
