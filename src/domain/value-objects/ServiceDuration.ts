import { ValueObject } from '@shared/base-classes/ValueObject';
import { ValidationError } from '@shared/errors/DomainError';

export class ServiceDuration extends ValueObject<number> {
  private static readonly MIN_DURATION = 15; // 15 minutes minimum
  private static readonly MAX_DURATION = 480; // 8 hours maximum

  protected validate(value: number): void {
    if (!value || typeof value !== 'number') {
      throw new ValidationError('Service duration is required and must be a number', 'serviceDuration');
    }

    if (value < ServiceDuration.MIN_DURATION) {
      throw new ValidationError(`Service duration must be at least ${ServiceDuration.MIN_DURATION} minutes`, 'serviceDuration');
    }

    if (value > ServiceDuration.MAX_DURATION) {
      throw new ValidationError(`Service duration cannot exceed ${ServiceDuration.MAX_DURATION} minutes`, 'serviceDuration');
    }

    // Must be divisible by 15 for booking slot alignment
    if (value % 15 !== 0) {
      throw new ValidationError('Service duration must be in 15-minute increments', 'serviceDuration');
    }
  }

  public static create(minutes: number): ServiceDuration {
    return new ServiceDuration(minutes);
  }

  public static fromHours(hours: number): ServiceDuration {
    return new ServiceDuration(hours * 60);
  }

  public static quick(): ServiceDuration {
    return new ServiceDuration(30); // 30 minutes
  }

  public static standard(): ServiceDuration {
    return new ServiceDuration(60); // 1 hour
  }

  public static extended(): ServiceDuration {
    return new ServiceDuration(120); // 2 hours
  }

  public getMinutes(): number {
    return this.value;
  }

  public getHours(): number {
    return this.value / 60;
  }

  public getDisplayTime(): string {
    const hours = Math.floor(this.value / 60);
    const minutes = this.value % 60;

    if (hours === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${minutes} min`;
    }
  }

  public addTime(additionalMinutes: number): ServiceDuration {
    return ServiceDuration.create(this.value + additionalMinutes);
  }

  public isQuickService(): boolean {
    return this.value <= 30;
  }

  public isStandardService(): boolean {
    return this.value > 30 && this.value <= 90;
  }

  public isExtendedService(): boolean {
    return this.value > 90;
  }

  public getTimeSlots(): number {
    return Math.ceil(this.value / 15); // Number of 15-minute slots needed
  }

  public static getAllowedDurations(): number[] {
    const durations: number[] = [];
    for (let i = ServiceDuration.MIN_DURATION; i <= ServiceDuration.MAX_DURATION; i += 15) {
      durations.push(i);
    }
    return durations;
  }
} 