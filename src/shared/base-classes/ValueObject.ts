export abstract class ValueObject<T> {
  protected readonly _value: T;

  constructor(value: T) {
    this.validate(value);
    this._value = value;
  }

  public get value(): T {
    return this._value;
  }

  protected abstract validate(value: T): void;

  public equals(valueObject: ValueObject<T>): boolean {
    if (!(valueObject instanceof ValueObject)) {
      return false;
    }

    return JSON.stringify(this._value) === JSON.stringify(valueObject.value);
  }

  public toString(): string {
    return String(this._value);
  }

  public toJSON(): T {
    return this._value;
  }
} 