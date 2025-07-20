export interface IRepository<TEntity, TId = string> {
  findById(id: TId): Promise<TEntity | null>;
  findAll(options?: FindAllOptions): Promise<PaginatedResult<TEntity>>;
  create(entity: TEntity): Promise<TEntity>;
  update(id: TId, entity: Partial<TEntity>): Promise<TEntity>;
  delete(id: TId): Promise<void>;
  exists(id: TId): Promise<boolean>;
}

export interface FindAllOptions {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, any>;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
} 