import Database from 'better-sqlite3';
import * as fs from 'fs-extra';
import * as path from 'path';
import { TestDirectoryManager } from '../file-system/test-directories';
import { MigrationManager } from './migration-manager';

export interface TestDatabaseConfig {
  path?: string;
  readonly?: boolean;
  memory?: boolean;
  verbose?: boolean;
}

export class TestDatabaseManager {
  private db: Database.Database | null = null;
  private readonly directoryManager: TestDirectoryManager;
  private readonly migrationManager: MigrationManager;
  private readonly config: TestDatabaseConfig;

  constructor(config: TestDatabaseConfig = {}) {
    this.directoryManager = new TestDirectoryManager();
    this.migrationManager = new MigrationManager();
    this.config = config;
  }

  /**
   * Initialize test database connection
   */
  async initialize(): Promise<void> {
    try {
      // Ensure directories exist
      await this.directoryManager.ensureDirectories();

      // Get database path
      const dbPath = this.config.path || this.getDefaultDatabasePath();
      
      // Create database connection
      this.db = new Database(dbPath, {
        readonly: this.config.readonly || false,
        verbose: this.config.verbose ? console.log : undefined
      });

      // Configure database settings for better performance
      this.configureDatabaseSettings();

      // Run migrations to ensure schema is current
      await this.migrationManager.migrate(this.db);

      console.log(`Test database initialized at: ${dbPath}`);
    } catch (error) {
      console.error('Failed to initialize test database:', error);
      throw error;
    }
  }

  /**
   * Get the database instance
   */
  getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('Test database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Execute raw SQL query
   */
  executeQuery(sql: string, params: any[] = []): any {
    if (!this.db) {
      throw new Error('Test database not initialized');
    }

    try {
      const stmt = this.db.prepare(sql);
      return stmt.all(...params);
    } catch (error) {
      console.error('SQL execution error:', error);
      throw error;
    }
  }

  /**
   * Execute SQL statement (INSERT, UPDATE, DELETE)
   */
  executeStatement(sql: string, params: any[] = []): Database.RunResult {
    if (!this.db) {
      throw new Error('Test database not initialized');
    }

    try {
      const stmt = this.db.prepare(sql);
      return stmt.run(...params);
    } catch (error) {
      console.error('SQL execution error:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  getStats(): any {
    if (!this.db) {
      throw new Error('Test database not initialized');
    }

    const stats = this.db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM projects) as project_count,
        (SELECT COUNT(*) FROM pages) as page_count,
        (SELECT COUNT(*) FROM assets) as asset_count,
        (SELECT COUNT(*) FROM templates) as template_count,
        (SELECT COUNT(*) FROM color_palettes) as palette_count,
        (SELECT COUNT(*) FROM project_versions) as version_count
    `).get();

    return stats;
  }

  /**
   * Check database integrity
   */
  checkIntegrity(): boolean {
    if (!this.db) {
      throw new Error('Test database not initialized');
    }

    const result = this.db.prepare('PRAGMA integrity_check').get() as any;
    return result.integrity_check === 'ok';
  }

  /**
   * Clean up test database and directories
   */
  async cleanup(): Promise<void> {
    this.close();
    await this.directoryManager.cleanup();
  }

  private getDefaultDatabasePath(): string {
    return this.config.memory ? ':memory:' : path.join(this.directoryManager.getConfigDir(), 'test.db');
  }

  private configureDatabaseSettings(): void {
    if (!this.db) return;

    // Enable WAL mode for better concurrency
    this.db.pragma('journal_mode = WAL');
    
    // Set synchronous mode for better performance
    this.db.pragma('synchronous = NORMAL');
    
    // Enable foreign key constraints
    this.db.pragma('foreign_keys = ON');
    
    // Set cache size (in KB)
    this.db.pragma('cache_size = 10000');
    
    // Set temp store to memory
    this.db.pragma('temp_store = MEMORY');
  }
}