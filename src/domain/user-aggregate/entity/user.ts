import { UserId, Email, Password } from '../value-object';
import { CreatedAt, UpdatedAt } from '@/domain/shared/value-object';

/**
 * ユーザーエンティティ
 */
export class User {
  private constructor(
    private readonly _id: UserId,
    private readonly _email: Email,
    private readonly _password: Password,
    private readonly _firstName: string,
    private readonly _lastName: string,
    private readonly _createdAt: CreatedAt,
    private readonly _updatedAt: UpdatedAt,
  ) {}

  static create(
    id: UserId,
    email: Email,
    password: Password,
    firstName: string,
    lastName: string,
  ): User {
    this.validateName(firstName, 'First name');
    this.validateName(lastName, 'Last name');

    const now = new Date();
    return new User(
      id,
      email,
      password,
      firstName,
      lastName,
      new CreatedAt(now),
      new UpdatedAt(now),
    );
  }

  static reconstruct(
    id: UserId,
    email: Email,
    password: Password,
    firstName: string,
    lastName: string,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
  ): User {
    this.validateName(firstName, 'First name');
    this.validateName(lastName, 'Last name');

    return new User(id, email, password, firstName, lastName, createdAt, updatedAt);
  }

  private static validateName(name: string, fieldName: string): void {
    if (!name || typeof name !== 'string') {
      throw new Error(`${fieldName} must be a non-empty string`);
    }

    if (name.length < 1 || name.length > 50) {
      throw new Error(`${fieldName} must be between 1 and 50 characters`);
    }
  }

  get id(): UserId {
    return this._id;
  }

  get email(): Email {
    return this._email;
  }

  get password(): Password {
    return this._password;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  get createdAt(): CreatedAt {
    return this._createdAt;
  }

  get updatedAt(): UpdatedAt {
    return this._updatedAt;
  }

  /**
   * パスワードを変更
   */
  changePassword(newPassword: Password): User {
    return new User(
      this._id,
      this._email,
      newPassword,
      this._firstName,
      this._lastName,
      this._createdAt,
      this._updatedAt.update(),
    );
  }

  /**
   * プロフィール情報を更新
   */
  updateProfile(firstName: string, lastName: string): User {
    User.validateName(firstName, 'First name');
    User.validateName(lastName, 'Last name');

    return new User(
      this._id,
      this._email,
      this._password,
      firstName,
      lastName,
      this._createdAt,
      this._updatedAt.update(),
    );
  }

  equals(other: User): boolean {
    return this._id.equals(other._id);
  }
}
