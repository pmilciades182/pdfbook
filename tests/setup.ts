import '@testing-library/jest-dom';
import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { DatabaseManager } from '../src/main/database/database-manager';

// Global test database instance
let testDbManager: DatabaseManager;
let testDbPath: string;

// Setup before all tests
beforeAll(async () => {
  // Create temporary directory for test database
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdfbook-test-'));
  testDbPath = path.join(tempDir, 'test.db');

  console.log(`Test database path: ${testDbPath}`);

  // Initialize test database
  testDbManager = new DatabaseManager({
    path: testDbPath,
    verbose: false // Set to true for SQL debugging
  });

  await testDbManager.initialize();
});

// Cleanup after all tests
afterAll(async () => {
  if (testDbManager) {
    testDbManager.close();
  }

  // Clean up test database file
  if (testDbPath) {
    try {
      await fs.remove(path.dirname(testDbPath));
    } catch (error) {
      console.error('Failed to cleanup test database:', error);
    }
  }
});

// Setup before each test
beforeEach(async () => {
  // Clear all data before each test while keeping schema
  if (testDbManager) {
    const db = testDbManager.getDatabase();
    
    // Disable foreign key constraints temporarily
    db.exec('PRAGMA foreign_keys = OFF');
    
    // Clear all data
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
      try {
        db.exec(`DELETE FROM ${table}`);
      } catch (error) {
        // Table might not exist, ignore
      }
    }

    // Re-enable foreign key constraints
    db.exec('PRAGMA foreign_keys = ON');

    // Re-insert default data
    await insertDefaultTestData();
  }
});

// Cleanup after each test
afterEach(() => {
  // Any per-test cleanup can go here
});

/**
 * Insert default test data
 */
async function insertDefaultTestData(): Promise<void> {
  if (!testDbManager) return;

  const db = testDbManager.getDatabase();

  // Insert default app settings
  const settingsStmt = db.prepare(`
    INSERT INTO app_settings (key, value) VALUES (?, ?)
  `);

  const defaultSettings = [
    ['schema_version', '1.0.0'],
    ['auto_save_interval', '30000'],
    ['max_backup_versions', '10'],
    ['default_page_format', 'A4'],
    ['default_page_orientation', 'portrait'],
    ['app_first_run', 'false']
  ];

  for (const [key, value] of defaultSettings) {
    settingsStmt.run(key, value);
  }

  // Insert default color palettes
  const paletteStmt = db.prepare(`
    INSERT INTO color_palettes (name, description, colors, theme_type, is_default) 
    VALUES (?, ?, ?, ?, ?)
  `);

  const defaultPalettes = [
    ['Test Classic', 'Test classic palette', '["#000000", "#FFFFFF", "#666666", "#CCCCCC"]', 'classic', 1],
    ['Test Modern', 'Test modern palette', '["#2563EB", "#1E40AF", "#F8FAFC", "#E2E8F0", "#64748B"]', 'modern', 0]
  ];

  for (const palette of defaultPalettes) {
    paletteStmt.run(...palette);
  }

  // Insert default templates
  const templateStmt = db.prepare(`
    INSERT INTO templates (name, category, html_template, css_template, is_builtin, description) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const defaultTemplates = [
    [
      'Test Blank Page', 
      'general', 
      '<div class="page-content"></div>', 
      '.page-content { padding: 2rem; }', 
      1, 
      'Test blank page template'
    ],
    [
      'Test Title Page', 
      'cover', 
      '<div class="title-page"><h1>Title</h1></div>', 
      '.title-page { text-align: center; }', 
      1, 
      'Test title page template'
    ]
  ];

  for (const template of defaultTemplates) {
    templateStmt.run(...template);
  }
}

/**
 * Get test database manager
 */
export function getTestDatabase(): DatabaseManager {
  if (!testDbManager) {
    throw new Error('Test database not initialized');
  }
  return testDbManager;
}

/**
 * Create test project
 */
export async function createTestProject(name: string = 'Test Project'): Promise<number> {
  const db = getTestDatabase().getDatabase();
  
  const result = db.prepare(`
    INSERT INTO projects (name, description, page_format, page_orientation) 
    VALUES (?, ?, ?, ?)
  `).run(name, 'Test project description', 'A4', 'portrait');

  return result.lastInsertRowid as number;
}

/**
 * Create test page
 */
export async function createTestPage(projectId: number, pageNumber: number = 1): Promise<number> {
  const db = getTestDatabase().getDatabase();
  
  const result = db.prepare(`
    INSERT INTO pages (project_id, page_number, name, html_content, css_styles) 
    VALUES (?, ?, ?, ?, ?)
  `).run(projectId, pageNumber, `Test Page ${pageNumber}`, '<p>Test content</p>', 'p { margin: 1rem; }');

  return result.lastInsertRowid as number;
}

/**
 * Create test asset
 */
export async function createTestAsset(projectId: number): Promise<number> {
  const db = getTestDatabase().getDatabase();
  
  // Create a simple test image buffer
  const testImageBuffer = Buffer.from('fake-image-data');
  
  const result = db.prepare(`
    INSERT INTO assets (project_id, filename, original_name, mime_type, file_size, file_data) 
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(projectId, 'test-image.png', 'test-image.png', 'image/png', testImageBuffer.length, testImageBuffer);

  return result.lastInsertRowid as number;
}

/**
 * Get test color palette ID
 */
export function getTestColorPaletteId(): number {
  const db = getTestDatabase().getDatabase();
  const result = db.prepare('SELECT id FROM color_palettes WHERE is_default = 1').get() as { id: number };
  return result.id;
}

/**
 * Get test template ID
 */
export function getTestTemplateId(category: string = 'general'): number {
  const db = getTestDatabase().getDatabase();
  const result = db.prepare('SELECT id FROM templates WHERE category = ? AND is_builtin = 1').get(category) as { id: number };
  return result.id;
}

// Make test utilities available globally
declare global {
  var testUtils: {
    getTestDatabase: typeof getTestDatabase;
    createTestProject: typeof createTestProject;
    createTestPage: typeof createTestPage;
    createTestAsset: typeof createTestAsset;
    getTestColorPaletteId: typeof getTestColorPaletteId;
    getTestTemplateId: typeof getTestTemplateId;
  };
}

global.testUtils = {
  getTestDatabase,
  createTestProject,
  createTestPage,
  createTestAsset,
  getTestColorPaletteId,
  getTestTemplateId
};