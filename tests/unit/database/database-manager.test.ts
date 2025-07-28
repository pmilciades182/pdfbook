import { describe, test, expect, beforeEach } from '@jest/globals';
import { DatabaseManager } from '../../../src/main/database/database-manager';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('DatabaseManager', () => {
  let dbManager: DatabaseManager;
  let tempDbPath: string;

  beforeEach(async () => {
    // Create temporary database for each test
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'db-test-'));
    tempDbPath = path.join(tempDir, 'test.db');
    
    dbManager = new DatabaseManager({ path: tempDbPath });
    await dbManager.initialize();
  });

  afterEach(() => {
    if (dbManager) {
      dbManager.close();
    }
  });

  test('should initialize database successfully', async () => {
    expect(dbManager.getDatabase()).toBeDefined();
    expect(await fs.pathExists(tempDbPath)).toBe(true);
  });

  test('should create all required tables', () => {
    const db = dbManager.getDatabase();
    
    const tables = [
      'app_settings',
      'projects', 
      'pages',
      'assets',
      'templates',
      'color_palettes',
      'project_versions'
    ];

    for (const table of tables) {
      const result = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name=?
      `).get(table);
      
      expect(result).toBeDefined();
    }
  });

  test('should insert default settings', () => {
    const db = dbManager.getDatabase();
    
    const settings = db.prepare('SELECT * FROM app_settings').all();
    expect(settings.length).toBeGreaterThan(0);
    
    const schemaVersion = db.prepare(`
      SELECT value FROM app_settings WHERE key = ?
    `).get('schema_version') as { value: string };
    
    expect(schemaVersion.value).toBe('1.0.0');
  });

  test('should insert default color palettes', () => {
    const db = dbManager.getDatabase();
    
    const palettes = db.prepare('SELECT * FROM color_palettes').all();
    expect(palettes.length).toBeGreaterThan(0);
    
    const defaultPalette = db.prepare(`
      SELECT * FROM color_palettes WHERE is_default = 1
    `).get();
    
    expect(defaultPalette).toBeDefined();
  });

  test('should insert default templates', () => {
    const db = dbManager.getDatabase();
    
    const templates = db.prepare('SELECT * FROM templates WHERE is_builtin = 1').all();
    expect(templates.length).toBeGreaterThan(0);
  });

  test('should execute queries correctly', () => {
    const result = dbManager.executeQuery('SELECT COUNT(*) as count FROM app_settings');
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0].count).toBeGreaterThan(0);
  });

  test('should execute statements correctly', () => {
    const result = dbManager.executeStatement(`
      INSERT INTO app_settings (key, value) VALUES (?, ?)
    `, ['test_key', 'test_value']);
    
    expect(result.lastInsertRowid).toBeDefined();
    expect(result.changes).toBe(1);
  });

  test('should get database statistics', () => {
    const stats = dbManager.getStats();
    
    expect(stats).toBeDefined();
    expect(typeof stats.project_count).toBe('number');
    expect(typeof stats.page_count).toBe('number');
    expect(typeof stats.asset_count).toBe('number');
    expect(typeof stats.template_count).toBe('number');
    expect(typeof stats.palette_count).toBe('number');
    expect(typeof stats.version_count).toBe('number');
  });

  test('should create backup successfully', async () => {
    const backupPath = await dbManager.createBackup();
    
    expect(await fs.pathExists(backupPath)).toBe(true);
    expect(backupPath).toContain('backup-');
    expect(backupPath).toEndWith('.db');
  });

  test('should check database integrity', () => {
    const isHealthy = dbManager.checkIntegrity();
    expect(isHealthy).toBe(true);
  });

  test('should handle vacuum operation', () => {
    expect(() => {
      dbManager.vacuum();
    }).not.toThrow();
  });

  test('should handle database close', () => {
    expect(() => {
      dbManager.close();
    }).not.toThrow();
    
    // Should throw error when trying to use closed database
    expect(() => {
      dbManager.getDatabase();
    }).toThrow('Database not initialized');
  });
});