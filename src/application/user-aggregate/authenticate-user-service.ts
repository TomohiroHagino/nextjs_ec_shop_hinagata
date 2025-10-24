import { User, Email, Password } from '@/domain/user-aggregate';
import { UserRepository, UserDomainService } from '@/domain/user-aggregate';
import { UserDto } from '../shared/dto';

/**
 * ユーザー認証サービス
 */
export class AuthenticateUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userDomainService: UserDomainService,
  ) {}

  async execute(email: string, password: string): Promise<UserDto> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const emailValueObject = new Email(email);

    // ドメインサービスで認証
    const user = await this.userDomainService.authenticateUser(emailValueObject, password);

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
