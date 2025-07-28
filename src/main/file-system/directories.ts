import { app } from 'electron';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

export class DirectoryManager {
  private readonly appName = 'pdfbook-editor';

  /**
   * Get configuration directory
   * Linux: ~/.config/pdfbook-editor/
   */
  getConfigDir(): string {
    if (process.platform === 'linux') {
      return path.join(os.homedir(), '.config', this.appName);
    }
    return app.getPath('userData');
  }

  /**
   * Get data directory for application data
   * Linux: ~/.local/share/pdfbook-editor/
   */
  getDataDir(): string {
    if (process.platform === 'linux') {
      return path.join(os.homedir(), '.local', 'share', this.appName);
    }
    return app.getPath('appData');
  }

  /**
   * Get templates directory
   * Linux: ~/.local/share/pdfbook-editor/templates/
   */
  getTemplatesDir(): string {
    return path.join(this.getDataDir(), 'templates');
  }

  /**
   * Get cache directory for temporary files
   * Linux: ~/.cache/pdfbook-editor/
   */
  getCacheDir(): string {
    if (process.platform === 'linux') {
      return path.join(os.homedir(), '.cache', this.appName);
    }
    return app.getPath('temp');
  }

  /**
   * Get default projects directory
   * Usually ~/Documents/PDFBooks/
   */
  getProjectsDir(): string {
    return path.join(app.getPath('documents'), 'PDFBooks');
  }

  /**
   * Get logs directory
   * Linux: ~/.cache/pdfbook-editor/logs/
   */
  getLogsDir(): string {
    return path.join(this.getCacheDir(), 'logs');
  }

  /**
   * Get backups directory
   * Linux: ~/.cache/pdfbook-editor/backups/
   */
  getBackupsDir(): string {
    return path.join(this.getCacheDir(), 'backups');
  }

  /**
   * Get temporary files directory
   * Linux: ~/.cache/pdfbook-editor/temp/
   */
  getTempDir(): string {
    return path.join(this.getCacheDir(), 'temp');
  }

  /**
   * Get exports directory (default export location)
   * Usually ~/Documents/PDFBooks/exports/
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
        // Set appropriate permissions for Linux
        if (process.platform === 'linux') {
          await fs.chmod(dir, 0o755);
        }
      } catch (error) {
        console.error(`Failed to create directory ${dir}:`, error);
        throw error;
      }
    }

    console.log('All application directories created successfully');
  }

  /**
   * Clean up cache directory
   */
  async cleanCache(olderThanDays: number = 7): Promise<void> {
    const cacheDir = this.getCacheDir();
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);

    try {
      const items = await fs.readdir(cacheDir);
      
      for (const item of items) {
        const itemPath = path.join(cacheDir, item);
        const stats = await fs.stat(itemPath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          await fs.remove(itemPath);
          console.log(`Cleaned up cache item: ${item}`);
        }
      }
    } catch (error) {
      console.error('Failed to clean cache:', error);
    }
  }

  /**
   * Get directory sizes for diagnostics
   */
  async getDirectorySizes(): Promise<Record<string, number>> {
    const directories = {
      config: this.getConfigDir(),
      data: this.getDataDir(),
      cache: this.getCacheDir(),
      projects: this.getProjectsDir()
    };

    const sizes: Record<string, number> = {};

    for (const [name, dir] of Object.entries(directories)) {
      try {
        sizes[name] = await this.getDirectorySize(dir);
      } catch {
        sizes[name] = 0;
      }
    }

    return sizes;
  }

  /**
   * Initialize default templates in templates directory
   */
  async initializeDefaultTemplates(): Promise<void> {
    const templatesDir = this.getTemplatesDir();
    
    // Create some basic template files
    const defaultTemplates = [
      {
        name: 'blank-page.html',
        content: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Blank Page</title>
    <style>
        .page-content {
            padding: 2rem;
            min-height: 100vh;
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="page-content">
        <!-- Your content here -->
    </div>
</body>
</html>`
      },
      {
        name: 'title-page.html',
        content: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Title Page</title>
    <style>
        .title-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            text-align: center;
            font-family: 'Times New Roman', serif;
        }
        .book-title {
            font-size: 3rem;
            margin-bottom: 2rem;
            font-weight: bold;
        }
        .book-author {
            font-size: 1.5rem;
            color: #666;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="title-page">
        <h1 class="book-title">Your Book Title</h1>
        <h2 class="book-author">Author Name</h2>
    </div>
</body>
</html>`
      }
    ];

    for (const template of defaultTemplates) {
      const templatePath = path.join(templatesDir, template.name);
      
      if (!await fs.pathExists(templatePath)) {
        await fs.writeFile(templatePath, template.content);
        console.log(`Created default template: ${template.name}`);
      }
    }
  }

  /**
   * Create application-specific file associations
   */
  async setupFileAssociations(): Promise<void> {
    if (process.platform !== 'linux') {
      return;
    }

    const desktopFile = `[Desktop Entry]
Name=PDF Book Editor
Comment=Create and edit books with professional PDF output
Exec=pdfbook-editor %f
Icon=pdfbook-editor
Terminal=false
Type=Application
MimeType=application/x-pdfbook;
Categories=Office;Publishing;
`;

    try {
      const applicationsDir = path.join(os.homedir(), '.local', 'share', 'applications');
      await fs.ensureDir(applicationsDir);
      
      const desktopFilePath = path.join(applicationsDir, 'pdfbook-editor.desktop');
      await fs.writeFile(desktopFilePath, desktopFile);
      
      console.log('Desktop file created for file associations');
    } catch (error) {
      console.error('Failed to setup file associations:', error);
    }
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;

    try {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = await fs.stat(itemPath);
        
        if (stats.isDirectory()) {
          totalSize += await this.getDirectorySize(itemPath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }

    return totalSize;
  }
}