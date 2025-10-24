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

/**
 * プロフィール更新コマンド
 */
export class UpdateUserProfileCommand extends BaseCommand {
  constructor(
    public readonly userId: string,
    public readonly firstName: string,
    public readonly lastName: string,
  ) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }

    if (!this.firstName || typeof this.firstName !== 'string') {
      throw new Error('First name is required');
    }

    if (!this.lastName || typeof this.lastName !== 'string') {
      throw new Error('Last name is required');
    }
  }
}

/**
 * パスワード変更コマンド
 */
export class ChangePasswordCommand extends BaseCommand {
  constructor(
    public readonly userId: string,
    public readonly currentPassword: string,
    public readonly newPassword: string,
  ) {
    super();
  }

  validate(): void {
    if (!this.userId || typeof this.userId !== 'string') {
      throw new Error('User ID is required');
    }

    if (!this.currentPassword || typeof this.currentPassword !== 'string') {
      throw new Error('Current password is required');
    }

    if (!this.newPassword || typeof this.newPassword !== 'string') {
      throw new Error('New password is required');
    }

    if (this.newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters');
    }
  }
}
