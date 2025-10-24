import { BaseDto } from './base-dto';

/**
 * ユーザーDTO
 */
export class UserDto extends BaseDto {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {
    super();
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
