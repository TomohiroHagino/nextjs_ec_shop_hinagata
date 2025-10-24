import { DomainException } from './domain-exception';

/**
 * バリデーション例外
 */
export class ValidationException extends DomainException {
  readonly code = 'VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
  }
}
