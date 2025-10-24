import { User, UserId, Email, Password } from '@/domain/user-aggregate';
import { UserRepository } from '@/domain/user-aggregate';
import { CreatedAt, UpdatedAt } from '@/domain/shared/value-object';
import { PrismaClient } from '@prisma/client';

/**
 * ユーザーリポジトリ実装
 */
export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: UserId): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { id: id.value },
    });

    if (!userData) {
      return null;
    }

    return User.reconstruct(
      new UserId(userData.id),
      new Email(userData.email),
      new Password(userData.password),
      userData.firstName,
      userData.lastName,
      new CreatedAt(userData.createdAt),
      new UpdatedAt(userData.updatedAt),
    );
  }

  async findByEmail(email: Email): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { email: email.value },
    });

    if (!userData) {
      return null;
    }

    return User.reconstruct(
      new UserId(userData.id),
      new Email(userData.email),
      new Password(userData.password),
      userData.firstName,
      userData.lastName,
      new CreatedAt(userData.createdAt),
      new UpdatedAt(userData.updatedAt),
    );
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id.value },
      update: {
        email: user.email.value,
        password: user.password.hashedValue,
        firstName: user.firstName,
        lastName: user.lastName,
        updatedAt: user.updatedAt.value,
      },
      create: {
        id: user.id.value,
        email: user.email.value,
        password: user.password.hashedValue,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt.value,
        updatedAt: user.updatedAt.value,
      },
    });
  }

  async delete(id: UserId): Promise<void> {
    await this.prisma.user.delete({
      where: { id: id.value },
    });
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.value },
    });
    return count > 0;
  }
}
