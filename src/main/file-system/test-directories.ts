import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

/**
 * Test-specific directory manager that doesn't rely on Electron app
 */
export class TestDirectoryManager {
  private readonly appName = 'pdfbook-editor-test';
  private readonly tempDir: string;

  constructor(tempDir?: string) {
    this.tempDir = tempDir || os.tmpdir();
  }

  /**
   * Get configuration directory for tests
   */
  getConfigDir(): string {
    return path.join(this.tempDir, '.config', this.appName);
  }

  /**
   * Get data directory for tests
   */
  getDataDir(): string {
    return path.join(this.tempDir, '.local', 'share', this.appName);
  }

  /**
   * Get templates directory for tests
   */
  getTemplatesDir(): string {
    return path.join(this.getDataDir(), 'templates');
  }

  /**
   * Get cache directory for tests
   */
  getCacheDir(): string {
    return path.join(this.tempDir, '.cache', this.appName);
  }

  /**
   * Get projects directory for tests
   */
  getProjectsDir(): string {
    return path.join(this.tempDir, 'Documents', 'PDFBooks');
  }

  /**
   * Get logs directory for tests
   */
  getLogsDir(): string {
    return path.join(this.getCacheDir(), 'logs');
  }

  /**
   * Get backups directory for tests
   */
  getBackupsDir(): string {
    return path.join(this.getCacheDir(), 'backups');
  }

  /**
   * Get temporary files directory for tests
   */
  getTempDir(): string {
    return path.join(this.getCacheDir(), 'temp');
  }

  /**
   * Get exports directory for tests
   */
  getExportsDir(): string {
    return path.join(this.getProjectsDir(), 'exports');
  }

  /**
   * Ensure all necessary directories exist
   */
  async ensureDirectories(): Promise<void> {
    const directories = [
      this.getConfigDir(),
      this.getDataDir(),
      this.getTemplatesDir(),
      this.getCacheDir(),
      this.getProjectsDir(),
      this.getLogsDir(),
      this.getBackupsDir(),
      this.getTempDir(),
      this.getExportsDir()
    ];

    for (const dir of directories) {
      try {
        await fs.ensureDir(dir);
      } catch (error) {
        console.error(`Failed to create test directory ${dir}:`, error);
        throw error;
      }
    }
  }

  /**
   * Clean up all test directories
   */
  async cleanup(): Promise<void> {
    try {
      const baseDirs = [
        path.join(this.tempDir, '.config', this.appName),
        path.join(this.tempDir, '.local'),
        path.join(this.tempDir, '.cache', this.appName),
        path.join(this.tempDir, 'Documents')
      ];

      for (const dir of baseDirs) {
        if (await fs.pathExists(dir)) {
          await fs.remove(dir);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup test directories:', error);
    }
  }
}