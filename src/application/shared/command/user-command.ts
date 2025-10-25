import { BaseCommand } from './base-command';

/**
 * ユーザー登録コマンド（RegisterUserCommand）
 * 
 * 役割:
 * - 新しいユーザーを登録するためのパラメータを定義
 * - ユーザーアカウントの作成操作を表現
 * 
 * 使用場面:
 * - POST /api/auth/register のリクエスト処理
 * - 新規会員登録
 * - ユーザーアカウント作成
 * 
 * パラメータ:
 * - email: メールアドレス（ログインID）
 * - password: パスワード（平文、ハッシュ化される）
 * - firstName: 名
 * - lastName: 姓
 * 
 * バリデーション:
 * - email, password, firstName, lastName が存在し、文字列であることを確認
 * - 不正なパラメータの場合はエラーを投げる
 * 
 * 注意点:
 * - メールアドレスの重複チェックが行われる
 * - パスワードは自動的にハッシュ化される
 * - ユーザーIDは自動生成される
 * - 登録後は自動的にログイン状態になる
 */
export class RegisterUserCommand extends BaseCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly firstName: string,
    public readonly lastName: string,
  ) {
    super();
  }

  validate(): void {
    if (!this.email || typeof this.email !== 'string') {
      throw new Error('Email is required');
    }

    if (!this.password || typeof this.password !== 'string') {
      throw new Error('Password is required');
    }

    if (!this.firstName || typeof this.firstName !== 'string') {
      throw new Error('First name is required');
    }

    if (!this.lastName || typeof this.lastName !== 'string') {
      throw new Error('Last name is required');
    }
  }
}

/**
 * プロフィール更新コマンド（UpdateUserProfileCommand）
 * 
 * 役割:
 * - ユーザーのプロフィール情報を更新するためのパラメータを定義
 * - 名前の変更操作を表現
 * 
 * 使用場面:
 * - PUT /api/users/profile のリクエスト処理
 * - プロフィール編集ページ
 * - ユーザー情報の更新
 * 
 * パラメータ:
 * - userId: ユーザーID（どのユーザーを更新するか）
 * - firstName: 新しい名
 * - lastName: 新しい姓
 * 
 * バリデーション:
 * - userId, firstName, lastName が存在し、文字列であることを確認
 * - 不正なパラメータの場合はエラーを投げる
 * 
 * 注意点:
 * - ユーザー本人のみ更新可能
 * - メールアドレスは変更できない（別のコマンドが必要）
 * - 更新後はヘッダーの表示名も更新される
 * - 過去の注文の名前は変更されない（スナップショット）
 */
export class UpdateUserProfileCommand extends BaseCommand {
  constructor(
    public readonly userId: string,
    public readonly firstName: string,
    public readonly lastName: string,
  ) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }

    if (!this.firstName || typeof this.firstName !== 'string') {
      throw new Error('First name is required');
    }

    if (!this.lastName || typeof this.lastName !== 'string') {
      throw new Error('Last name is required');
    }
  }
}

/**
 * パスワード変更コマンド（ChangePasswordCommand）
 * 
 * 役割:
 * - ユーザーのパスワードを変更するためのパラメータを定義
 * - セキュリティのためのパスワード更新操作を表現
 * 
 * 使用場面:
 * - PUT /api/users/password のリクエスト処理
 * - プロフィール編集ページのパスワード変更
 * - セキュリティ設定の更新
 * 
 * パラメータ:
 * - userId: ユーザーID（どのユーザーのパスワードを変更するか）
 * - currentPassword: 現在のパスワード（認証用）
 * - newPassword: 新しいパスワード（平文、ハッシュ化される）
 * 
 * バリデーション:
 * - userId, currentPassword, newPassword が存在し、文字列であることを確認
 * - newPassword が8文字以上であることを確認
 * - 不正なパラメータの場合はエラーを投げる
 * 
 * 注意点:
 * - 現在のパスワードが正しいことを確認
 * - 新しいパスワードは自動的にハッシュ化される
 * - ユーザー本人のみ変更可能
 * - 変更後は自動的にログアウトされる（再ログインが必要）
 */
export class ChangePasswordCommand extends BaseCommand {
  constructor(
    public readonly userId: string,
    public readonly currentPassword: string,
    public readonly newPassword: string,
  ) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }

    if (!this.currentPassword || typeof this.currentPassword !== 'string') {
      throw new Error('Current password is required');
    }

    if (!this.newPassword || typeof this.newPassword !== 'string') {
      throw new Error('New password is required');
    }

    if (this.newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters');
    }
  }
}
