import Database from 'better-sqlite3';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface Migration {
  version: string;
  description: string;
  up: (db: Database.Database) => void;
  down?: (db: Database.Database) => void;
}

export class MigrationManager {
  private migrations: Migration[] = [];

  constructor() {
    this.initializeMigrations();
  }

  /**
   * Run all pending migrations
   */
  async migrate(db: Database.Database): Promise<void> {
    try {
      // Ensure migration table exists
      this.createMigrationTable(db);

      // Get current version
      const currentVersion = this.getCurrentVersion(db);
      const targetVersion = this.getLatestVersion();

      console.log(`Current schema version: ${currentVersion}`);
      console.log(`Target schema version: ${targetVersion}`);

      if (currentVersion === targetVersion) {
        console.log('Database schema is up to date');
        return;
      }

      // Apply migrations in order
      const transaction = db.transaction(() => {
        for (const migration of this.migrations) {
          if (this.shouldApplyMigration(migration.version, currentVersion, targetVersion)) {
            console.log(`Applying migration: ${migration.version} - ${migration.description}`);
            migration.up(db);
            this.updateVersion(db, migration.version);
          }
        }
      });

      transaction();

      console.log(`Database migrated to version: ${targetVersion}`);
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Rollback to a specific version
   */
  async rollback(db: Database.Database, targetVersion: string): Promise<void> {
    const currentVersion = this.getCurrentVersion(db);
    
    if (currentVersion === targetVersion) {
      console.log('Already at target version');
      return;
    }

    const transaction = db.transaction(() => {
      // Find migrations to rollback (in reverse order)
      const migrationsToRollback = this.migrations
        .filter(m => this.shouldRollback(m.version, currentVersion, targetVersion))
        .reverse();

      for (const migration of migrationsToRollback) {
        if (migration.down) {
          console.log(`Rolling back migration: ${migration.version}`);
          migration.down(db);
        } else {
          throw new Error(`Migration ${migration.version} has no rollback function`);
        }
      }

      this.updateVersion(db, targetVersion);
    });

    transaction();

    console.log(`Database rolled back to version: ${targetVersion}`);
  }

  /**
   * Get list of applied migrations
   */
  getAppliedMigrations(db: Database.Database): string[] {
    try {
      const rows = db.prepare(`
        SELECT version FROM schema_migrations ORDER BY applied_at ASC
      `).all() as any[];

      return rows.map(row => row.version);
    } catch {
      return [];
    }
  }

  /**
   * Get current schema version
   */
  getCurrentVersion(db: Database.Database): string {
    try {
      // First check if we have the migration table
      const migrationTableExists = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='schema_migrations'
      `).get();

      if (!migrationTableExists) {
        return '0.0.0';
      }

      // Get the latest migration version
      const result = db.prepare(`
        SELECT version FROM schema_migrations 
        ORDER BY applied_at DESC LIMIT 1
      `).get() as any;

      return result ? result.version : '0.0.0';
    } catch {
      return '0.0.0';
    }
  }

  /**
   * Get the latest available migration version
   */
  getLatestVersion(): string {
    if (this.migrations.length === 0) {
      return '1.0.0';
    }
    return this.migrations[this.migrations.length - 1].version;
  }

  private initializeMigrations(): void {
    this.migrations = [
      {
        version: '1.0.0',
        description: 'Initial database schema',
        up: (db: Database.Database) => {
          // Read and execute the initial schema
          const schemaPath = path.join(__dirname, 'schema.sql');
          const schema = fs.readFileSync(schemaPath, 'utf8');
          
          // Split by semicolon and execute each statement
          const statements = schema.split(';').filter(stmt => stmt.trim());
          
          for (const statement of statements) {
            if (statement.trim()) {
              try {
                db.exec(statement.trim());
              } catch (error) {
                // Skip if table already exists or other non-critical errors
                if (error instanceof Error && !error.message.includes('already exists')) {
                  throw error;
                }
              }
            }
          }
        },
        down: (db: Database.Database) => {
          // Drop all tables (careful!)
          const tables = [
            'project_versions',
            'assets',
            'pages',
            'projects',
            'templates',
            'color_palettes',
            'app_settings'
          ];

          for (const table of tables) {
            db.exec(`DROP TABLE IF EXISTS ${table}`);
          }
        }
      }
      // Future migrations will be added here
    ];
  }

  private createMigrationTable(db: Database.Database): void {
    db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT NOT NULL UNIQUE,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  private updateVersion(db: Database.Database, version: string): void {
    db.prepare(`
      INSERT OR REPLACE INTO schema_migrations (version)
      VALUES (?)
    `).run(version);
  }

  private shouldApplyMigration(
    migrationVersion: string,
    currentVersion: string,
    targetVersion: string
  ): boolean {
    return this.compareVersions(migrationVersion, currentVersion) > 0 &&
           this.compareVersions(migrationVersion, targetVersion) <= 0;
  }

  private shouldRollback(
    migrationVersion: string,
    currentVersion: string,
    targetVersion: string
  ): boolean {
    return this.compareVersions(migrationVersion, targetVersion) > 0 &&
           this.compareVersions(migrationVersion, currentVersion) <= 0;
  }

  private compareVersions(a: string, b: string): number {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const partA = partsA[i] || 0;
      const partB = partsB[i] || 0;
      
      if (partA > partB) return 1;
      if (partA < partB) return -1;
    }
    
    return 0;
  }
}