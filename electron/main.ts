import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron';
import * as path from 'path';
import { isDev } from './utils/environment';
import { IPCHandlers } from './ipc/handlers';
import { createApplicationMenu } from './menu/application-menu';

class PDFBookEditorApp {
  private mainWindow: BrowserWindow | null = null;
  private ipcHandlers: IPCHandlers;

  constructor() {
    this.ipcHandlers = new IPCHandlers();
    this.initializeApp();
  }

  private initializeApp(): void {
    // Handle app ready
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupApplicationMenu();
      this.setupIPC();
      
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createMainWindow();
        }
      });
    });

    // Handle window closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Security: Prevent new window creation
    app.on('web-contents-created', (event, contents) => {
      contents.setWindowOpenHandler(({ url }) => {
        console.log('Blocked new window creation:', url);
        return { action: 'deny' };
      });
    });
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 800,
      show: false,
      icon: path.join(__dirname, '../assets/icons/app-icon.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false,
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    // Load the app
    if (isDev()) {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../dist/renderer/index.html'));
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      if (this.mainWindow) {
        this.mainWindow.show();
        
        if (isDev()) {
          this.mainWindow.webContents.openDevTools();
        }
      }
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Handle window state changes
    this.mainWindow.on('maximize', () => {
      this.mainWindow?.webContents.send('window-maximized');
    });

    this.mainWindow.on('unmaximize', () => {
      this.mainWindow?.webContents.send('window-unmaximized');
    });
  }

  private setupApplicationMenu(): void {
    const menu = createApplicationMenu({
      onNew: () => this.handleNewProject(),
      onOpen: () => this.handleOpenProject(),
      onSave: () => this.handleSaveProject(),
      onQuit: () => app.quit(),
    });
    
    Menu.setApplicationMenu(menu);
  }

  private setupIPC(): void {
    this.ipcHandlers.setupHandlers();
  }

  private async handleNewProject(): Promise<void> {
    this.mainWindow?.webContents.send('menu-new-project');
  }

  private async handleOpenProject(): Promise<void> {
    if (!this.mainWindow) return;

    const result = await dialog.showOpenDialog(this.mainWindow, {
      title: 'Open PDF Book Project',
      filters: [
        { name: 'PDF Book Files', extensions: ['pdfbook'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      this.mainWindow.webContents.send('menu-open-project', result.filePaths[0]);
    }
  }

  private async handleSaveProject(): Promise<void> {
    this.mainWindow?.webContents.send('menu-save-project');
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }
}

// Create and export app instance
const pdfBookEditorApp = new PDFBookEditorApp();

export { pdfBookEditorApp };