import { UserId } from '@/domain/user-aggregate';
import { UserRepository, UserDomainService } from '@/domain/user-aggregate';
import { Password } from '@/domain/user-aggregate/value-object';
import { ChangePasswordCommand } from '../shared/command';

/**
 * パスワード変更サービス
 */
export class ChangePasswordService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userDomainService: UserDomainService,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    command.validate();

    const userId = new UserId(command.userId);
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // 現在のパスワードを検証
    const isValidPassword = await user.password.compare(command.currentPassword);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // 新しいパスワードを作成
    const newPassword = await Password.fromPlainText(command.newPassword);

    // パスワードを変更
    const updatedUser = user.changePassword(newPassword);

    // リポジトリに保存
    await this.userRepository.save(updatedUser);
  }
}

