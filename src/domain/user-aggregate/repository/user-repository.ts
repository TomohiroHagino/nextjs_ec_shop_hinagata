import { User } from '../entity';
import { UserId, Email } from '../value-object';

/**
 * ユーザーリポジトリインターフェース
 */
export interface UserRepository {
  /**
   * IDでユーザーを取得
   */
  findById(id: UserId): Promise<User | null>;

  /**
   * メールアドレスでユーザーを取得
   */
  findByEmail(email: Email): Promise<User | null>;

  /**
   * ユーザーを保存
   */
  save(user: User): Promise<void>;

  /**
   * ユーザーを削除
   */
  delete(id: UserId): Promise<void>;

  /**
   * メールアドレスが存在するかチェック
   */
  existsByEmail(email: Email): Promise<boolean>;
}
