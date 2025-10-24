import { User, UserId, Email, Password } from '@/domain/user-aggregate';
import { UserRepository, UserDomainService } from '@/domain/user-aggregate';
import { RegisterUserCommand } from '../shared/command';
import { UserDto } from '../shared/dto';
import { v4 as uuidv4 } from 'uuid';

/**
 * ユーザー登録サービス
 */
export class RegisterUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userDomainService: UserDomainService,
  ) {}

  async execute(command: RegisterUserCommand): Promise<UserDto> {
    command.validate();

    const email = new Email(command.email);
    const password = Password.fromPlainText(command.password);
    const userId = new UserId(uuidv4());

    // ドメインサービスでビジネスルール検証
    await this.userDomainService.validateUserRegistration(
      email,
      password,
      command.firstName,
      command.lastName,
    );

    // ユーザーエンティティ作成
    const user = User.create(
      userId,
      email,
      password,
      command.firstName,
      command.lastName,
    );

    // リポジトリに保存
    await this.userRepository.save(user);

    // DTOに変換して返却
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
