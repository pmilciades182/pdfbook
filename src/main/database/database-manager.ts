import Database from 'better-sqlite3';
import * as fs from 'fs-extra';
import * as path from 'path';
import { DirectoryManager } from '../file-system/directories';
import { MigrationManager } from './migration-manager';

export interface DatabaseConfig {
  path?: string;
  readonly?: boolean;
  memory?: boolean;
  verbose?: boolean;
}

export class DatabaseManager {
  private db: Database.Database | null = null;
  private readonly directoryManager: DirectoryManager;
  private readonly migrationManager: MigrationManager;
  private readonly config: DatabaseConfig;

  constructor(config: DatabaseConfig = {}) {
    this.directoryManager = new DirectoryManager();
    this.migrationManager = new MigrationManager();
    this.config = config;
  }

  /**
   * Initialize database connection and ensure schema is up to date
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

      console.log(`Database initialized at: ${dbPath}`);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Get the database instance
   */
  getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
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
      console.log('Database connection closed');
    }
  }

  /**
   * Create a backup of the current database
   */
  async createBackup(backupPath?: string): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const finalBackupPath = backupPath || path.join(
      this.directoryManager.getCacheDir(),
      'backups',
      `backup-${timestamp}.db`
    );

    await fs.ensureDir(path.dirname(finalBackupPath));
    await this.db.backup(finalBackupPath);

    console.log(`Database backup created: ${finalBackupPath}`);
    return finalBackupPath;
  }

  /**
   * Restore database from backup
   */
  async restoreFromBackup(backupPath: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    if (!await fs.pathExists(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    // Close current connection
    this.close();

    // Copy backup to current database location
    const currentDbPath = this.getDefaultDatabasePath();
    await fs.copy(backupPath, currentDbPath);

    // Reinitialize database
    await this.initialize();

    console.log(`Database restored from backup: ${backupPath}`);
  }

  /**
   * Execute raw SQL query
   */
  executeQuery(sql: string, params: any[] = []): any {
    if (!this.db) {
      throw new Error('Database not initialized');
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
      throw new Error('Database not initialized');
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
   * Begin transaction
   */
  beginTransaction(): Database.Transaction {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return this.db.transaction(() => {
      // Transaction callback will be provided by caller
    });
  }

  /**
   * Get database statistics
   */
  getStats(): any {
    if (!this.db) {
      throw new Error('Database not initialized');
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
   * Vacuum database to optimize performance
   */
  vacuum(): void {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    this.db.exec('VACUUM');
    console.log('Database vacuum completed');
  }

  /**
   * Check database integrity
   */
  checkIntegrity(): boolean {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const result = this.db.prepare('PRAGMA integrity_check').get() as any;
    const isHealthy = result.integrity_check === 'ok';
    
    if (!isHealthy) {
      console.error('Database integrity check failed:', result);
    }

    return isHealthy;
  }

  private getDefaultDatabasePath(): string {
    return path.join(this.directoryManager.getConfigDir(), 'database.db');
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
    
    // Optimize for faster writes
    this.db.pragma('locking_mode = EXCLUSIVE');
  }
}

// Singleton instance for application-wide use
export const databaseManager = new DatabaseManager();