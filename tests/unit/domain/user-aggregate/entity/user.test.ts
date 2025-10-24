import { User, UserId, Email, Password } from '@/domain/user-aggregate';
import { CreatedAt, UpdatedAt } from '@/domain/shared/value-object';

// bcryptjsをモック化
jest.mock('bcryptjs', () => ({
  hashSync: jest.fn((password: string) => `hashed_${password}`),
  compareSync: jest.fn((password: string, hash: string) => hash === `hashed_${password}`),
}));

describe('User', () => {
  const userId = new UserId('user-123');
  const email = new Email('test@example.com');
  const password = Password.fromPlainText('password123');
  const firstName = 'John';
  const lastName = 'Doe';
  const createdAt = new CreatedAt();
  const updatedAt = new UpdatedAt();

  describe('create', () => {
    it('should create a new user', () => {
      const user = User.create(userId, email, password, firstName, lastName);

      expect(user.id).toBe(userId);
      expect(user.email).toBe(email);
      expect(user.password).toBe(password);
      expect(user.firstName).toBe(firstName);
      expect(user.lastName).toBe(lastName);
      expect(user.fullName).toBe('John Doe');
    });

    it('should throw error for invalid first name', () => {
      expect(() => User.create(userId, email, password, '', lastName)).toThrow();
      expect(() => User.create(userId, email, password, 'a'.repeat(51), lastName)).toThrow();
    });

    it('should throw error for invalid last name', () => {
      expect(() => User.create(userId, email, password, firstName, '')).toThrow();
      expect(() => User.create(userId, email, password, firstName, 'a'.repeat(51))).toThrow();
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct user from existing data', () => {
      const user = User.reconstruct(
        userId,
        email,
        password,
        firstName,
        lastName,
        createdAt,
        updatedAt,
      );

      expect(user.id).toBe(userId);
      expect(user.email).toBe(email);
      expect(user.password).toBe(password);
      expect(user.firstName).toBe(firstName);
      expect(user.lastName).toBe(lastName);
      expect(user.createdAt).toBe(createdAt);
      expect(user.updatedAt).toBe(updatedAt);
    });
  });

  describe('changePassword', () => {
    it('should change password and update timestamp', () => {
      const user = User.create(userId, email, password, firstName, lastName);
      const newPassword = Password.fromPlainText('newpassword123');

      const updatedUser = user.changePassword(newPassword);

      expect(updatedUser.password).toBe(newPassword);
      expect(updatedUser.updatedAt.value.getTime()).toBeGreaterThanOrEqual(user.updatedAt.value.getTime());
    });
  });

  describe('updateProfile', () => {
    it('should update profile and update timestamp', () => {
      const user = User.create(userId, email, password, firstName, lastName);
      const newFirstName = 'Jane';
      const newLastName = 'Smith';

      const updatedUser = user.updateProfile(newFirstName, newLastName);

      expect(updatedUser.firstName).toBe(newFirstName);
      expect(updatedUser.lastName).toBe(newLastName);
      expect(updatedUser.fullName).toBe('Jane Smith');
      expect(updatedUser.updatedAt.value.getTime()).toBeGreaterThanOrEqual(user.updatedAt.value.getTime());
    });

    it('should throw error for invalid names', () => {
      const user = User.create(userId, email, password, firstName, lastName);

      expect(() => user.updateProfile('', lastName)).toThrow();
      expect(() => user.updateProfile(firstName, '')).toThrow();
    });
  });

  describe('equals', () => {
    it('should return true for same user', () => {
      const user1 = User.create(userId, email, password, firstName, lastName);
      const user2 = User.create(userId, email, password, firstName, lastName);

      expect(user1.equals(user2)).toBe(true);
    });

    it('should return false for different users', () => {
      const user1 = User.create(userId, email, password, firstName, lastName);
      const user2 = User.create(new UserId('user-456'), email, password, firstName, lastName);

      expect(user1.equals(user2)).toBe(false);
    });
  });
});
