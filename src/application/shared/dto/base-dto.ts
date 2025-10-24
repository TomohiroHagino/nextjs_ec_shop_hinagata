/**
 * 基底DTOクラス
 */
export abstract class BaseDto {
  abstract toJSON(): Record<string, any>;
}
