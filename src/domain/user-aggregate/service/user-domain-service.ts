import { User } from '../entity';
import { UserId, Email, Password } from '../value-object';
import { UserRepository } from '../repository';
import { ValidationException } from '@/domain/shared/exception';

/**
 * ユーザードメインサービス
 */
export class UserDomainService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * ユーザー登録時のビジネスルール検証
   */
  async validateUserRegistration(
    email: Email,
    password: Password,
    firstName: string,
    lastName: string,
  ): Promise<void> {
    // メールアドレスの重複チェック
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ValidationException('User with this email already exists');
    }

    // その他のビジネスルール検証
    this.validateName(firstName, 'First name');
    this.validateName(lastName, 'Last name');
  }

  /**
   * ユーザー認証
   */
  async authenticateUser(email: Email, plainPassword: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new ValidationException('Invalid email or password');
    }

    if (!user.password.compare(plainPassword)) {
      throw new ValidationException('Invalid email or password');
    }

    return user;
  }

  /**
   * ユーザー存在確認
   */
  async ensureUserExists(userId: UserId): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ValidationException('User not found');
    }
    return user;
  }

  private validateName(name: string, fieldName: string): void {
    if (!name || typeof name !== 'string') {
      throw new ValidationException(`${fieldName} must be a non-empty string`);
    }

    if (name.length < 1 || name.length > 50) {
      throw new ValidationException(`${fieldName} must be between 1 and 50 characters`);
    }
  }
}
