import { BaseCommand } from './base-command';

/**
 * ユーザー登録コマンド
 */
export class RegisterUserCommand extends BaseCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly firstName: string,
    public readonly lastName: string,
  ) {
    super();
  }

  validate(): void {
    if (!this.email || typeof this.email !== 'string') {
      throw new Error('Email is required');
    }

    if (!this.password || typeof this.password !== 'string') {
      throw new Error('Password is required');
    }

    if (!this.firstName || typeof this.firstName !== 'string') {
      throw new Error('First name is required');
    }

    if (!this.lastName || typeof this.lastName !== 'string') {
      throw new Error('Last name is required');
    }
  }
}
