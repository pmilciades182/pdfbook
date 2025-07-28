import Database from 'better-sqlite3';
import { z } from 'zod';

export abstract class BaseService {
  protected db: Database.Database;
  
  constructor(db: Database.Database) {
    this.db = db;
  }

  /**
   * Validate data against a Zod schema
   */
  protected validate<T>(data: any, schema: z.ZodSchema<T>): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorDetails = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new Error(`Validation failed: ${errorDetails}`);
      }
      throw error;
    }
  }

  /**
   * Handle and log errors consistently
   */
  protected handleError(error: Error, context: string): never {
    console.error(`Error in ${context}:`, error);
    
    // Add more specific error handling based on error type
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error('A record with this information already exists');
    }
    
    if (error.message.includes('FOREIGN KEY constraint failed')) {
      throw new Error('Cannot perform this operation due to related data');
    }
    
    if (error.message.includes('NOT NULL constraint failed')) {
      throw new Error('Required information is missing');
    }

    // Re-throw the original error if we don't have specific handling
    throw error;
  }

  /**
   * Execute a prepared statement with error handling
   */
  protected executeStatement(sql: string, params: any[] = []): Database.RunResult {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.run(...params);
    } catch (error) {
      this.handleError(error as Error, 'executeStatement');
    }
  }

  /**
   * Execute a query and return all results
   */
  protected executeQuery<T = any>(sql: string, params: any[] = []): T[] {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.all(...params) as T[];
    } catch (error) {
      this.handleError(error as Error, 'executeQuery');
    }
  }

  /**
   * Execute a query and return first result
   */
  protected executeQueryOne<T = any>(sql: string, params: any[] = []): T | null {
    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.get(...params) as T;
      return result || null;
    } catch (error) {
      this.handleError(error as Error, 'executeQueryOne');
    }
  }

  /**
   * Create a transaction
   */
  protected createTransaction<T extends any[], R>(
    callback: (...args: T) => R
  ): (...args: T) => R {
    return this.db.transaction(callback);
  }

  /**
   * Get current timestamp for database operations
   */
  protected getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Build WHERE clause from filter object
   */
  protected buildWhereClause(filters: Record<string, any>): { clause: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          conditions.push(`${key} IN (${value.map(() => '?').join(', ')})`);
          params.push(...value);
        } else if (typeof value === 'string' && value.includes('%')) {
          conditions.push(`${key} LIKE ?`);
          params.push(value);
        } else {
          conditions.push(`${key} = ?`);
          params.push(value);
        }
      }
    }

    const clause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { clause, params };
  }

  /**
   * Build ORDER BY clause
   */
  protected buildOrderClause(orderBy?: string, direction: 'ASC' | 'DESC' = 'ASC'): string {
    if (!orderBy) return '';
    return `ORDER BY ${orderBy} ${direction}`;
  }

  /**
   * Build LIMIT and OFFSET clause for pagination
   */
  protected buildPaginationClause(page?: number, limit?: number): string {
    if (!limit) return '';
    const offset = page ? (page - 1) * limit : 0;
    return `LIMIT ${limit} OFFSET ${offset}`;
  }
}

/**
 * Generic CRUD operations interface
 */
export interface CrudOperations<T, CreateData, UpdateData> {
  create(data: CreateData): Promise<T>;
  getById(id: number): Promise<T | null>;
  getAll(filters?: Record<string, any>): Promise<T[]>;
  update(id: number, data: UpdateData): Promise<T>;
  delete(id: number): Promise<void>;
  count(filters?: Record<string, any>): Promise<number>;
}

/**
 * Pagination interface
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  direction?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}