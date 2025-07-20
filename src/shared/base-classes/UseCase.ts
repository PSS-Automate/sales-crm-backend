export abstract class UseCase<TRequest = any, TResponse = any> {
  public abstract execute(request: TRequest): Promise<TResponse>;
} 