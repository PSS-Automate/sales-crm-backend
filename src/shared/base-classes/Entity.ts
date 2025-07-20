export abstract class Entity<T> {
  protected readonly _id: T;
  protected readonly _createdAt: Date;
  protected _updatedAt: Date;

  constructor(props: { id: T; createdAt?: Date; updatedAt?: Date }) {
    this._id = props.id;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  public get id(): T {
    return this._id;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }

  public equals(entity: Entity<T>): boolean {
    if (!(entity instanceof Entity)) {
      return false;
    }

    return this._id === entity.id;
  }

  public abstract toJSON(): Record<string, any>;
} 