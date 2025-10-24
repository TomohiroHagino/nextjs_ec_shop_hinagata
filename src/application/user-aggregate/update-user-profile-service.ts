import { User, UserId } from '@/domain/user-aggregate';
import { UserRepository, UserDomainService } from '@/domain/user-aggregate';
import { UpdateUserProfileCommand } from '../shared/command';
import { UserDto } from '../shared/dto';

/**
 * プロフィール更新サービス
 */
export class UpdateUserProfileService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userDomainService: UserDomainService,
  ) {}

  async execute(command: UpdateUserProfileCommand): Promise<UserDto> {
    command.validate();

    const userId = new UserId(command.userId);
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // プロフィールを更新
    const updatedUser = user.updateProfile(command.firstName, command.lastName);

    // リポジトリに保存
    await this.userRepository.save(updatedUser);

    // DTOに変換して返却
    return this.toUserDto(updatedUser);
  }

  private toUserDto(user: User): UserDto {
    return new UserDto(
      user.id.value,
      user.email.value,
      user.firstName,
      user.lastName,
      user.createdAt.toString(),
      user.updatedAt.toString(),
    );
  }
}

