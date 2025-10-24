import { User, UserId } from '@/domain/user-aggregate';
import { UserRepository, UserDomainService } from '@/domain/user-aggregate';
import { GetUserQuery } from '../shared/query';
import { UserDto } from '../shared/dto';

/**
 * ユーザー取得サービス
 */
export class GetUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userDomainService: UserDomainService,
  ) {}

  async execute(query: GetUserQuery): Promise<UserDto> {
    query.validate();

    const userId = new UserId(query.userId);

    // ドメインサービスでユーザー存在確認
    const user = await this.userDomainService.ensureUserExists(userId);

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
