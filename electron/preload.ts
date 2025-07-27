import { contextBridge, ipcRenderer } from 'electron';

// Define the API that will be exposed to the renderer process
interface ElectronAPI {
  // Project operations
  createProject: (data: any) => Promise<any>;
  openProject: (filePath: string) => Promise<any>;
  saveProject: (projectId: number) => Promise<void>;
  exportProject: (projectId: number, format: string) => Promise<string>;
  getRecentProjects: () => Promise<any[]>;
  deleteProject: (projectId: number) => Promise<void>;

  // Page operations
  createPage: (projectId: number, templateId?: number) => Promise<any>;
  updatePage: (pageId: number, content: any) => Promise<any>;
  deletePage: (pageId: number) => Promise<void>;
  getPage: (pageId: number) => Promise<any>;
  getProjectPages: (projectId: number) => Promise<any[]>;
  reorderPages: (projectId: number, pageOrder: number[]) => Promise<void>;

  // Asset operations
  importAsset: (filePath: string, projectId: number) => Promise<any>;
  getAsset: (assetId: number) => Promise<any>;
  getProjectAssets: (projectId: number) => Promise<any[]>;
  deleteAsset: (assetId: number) => Promise<void>;
  optimizeAsset: (assetId: number, options: any) => Promise<any>;

  // Template operations
  getTemplates: () => Promise<any[]>;
  getTemplate: (templateId: number) => Promise<any>;
  createTemplate: (data: any) => Promise<any>;
  deleteTemplate: (templateId: number) => Promise<void>;

  // Color palette operations
  getColorPalettes: () => Promise<any[]>;
  createColorPalette: (data: any) => Promise<any>;
  updateColorPalette: (paletteId: number, data: any) => Promise<any>;
  deleteColorPalette: (paletteId: number) => Promise<void>;

  // File system operations
  showOpenDialog: (options: any) => Promise<string[]>;
  showSaveDialog: (options: any) => Promise<string>;
  showMessageBox: (options: any) => Promise<any>;

  // PDF operations
  generatePDF: (projectId: number, options: any) => Promise<Buffer>;
  previewPage: (pageId: number) => Promise<string>;

  // Application operations
  getAppVersion: () => Promise<string>;
  getAppSettings: () => Promise<any>;
  updateAppSettings: (settings: any) => Promise<void>;

  // Event listeners
  onMenuAction: (callback: (action: string, data?: any) => void) => void;
  onWindowStateChange: (callback: (state: string) => void) => void;
  removeAllListeners: (channel: string) => void;

  // Generic IPC invoke
  invoke: (channel: string, ...args: any[]) => Promise<any>;
}

// Expose the API to the renderer process
const electronAPI: ElectronAPI = {
  // Project operations
  createProject: (data) => ipcRenderer.invoke('project:create', data),
  openProject: (filePath) => ipcRenderer.invoke('project:open', filePath),
  saveProject: (projectId) => ipcRenderer.invoke('project:save', projectId),
  exportProject: (projectId, format) => ipcRenderer.invoke('project:export', projectId, format),
  getRecentProjects: () => ipcRenderer.invoke('project:getRecent'),
  deleteProject: (projectId) => ipcRenderer.invoke('project:delete', projectId),

  // Page operations
  createPage: (projectId, templateId) => ipcRenderer.invoke('page:create', projectId, templateId),
  updatePage: (pageId, content) => ipcRenderer.invoke('page:update', pageId, content),
  deletePage: (pageId) => ipcRenderer.invoke('page:delete', pageId),
  getPage: (pageId) => ipcRenderer.invoke('page:get', pageId),
  getProjectPages: (projectId) => ipcRenderer.invoke('page:getByProject', projectId),
  reorderPages: (projectId, pageOrder) => ipcRenderer.invoke('page:reorder', projectId, pageOrder),

  // Asset operations
  importAsset: (filePath, projectId) => ipcRenderer.invoke('asset:import', filePath, projectId),
  getAsset: (assetId) => ipcRenderer.invoke('asset:get', assetId),
  getProjectAssets: (projectId) => ipcRenderer.invoke('asset:getByProject', projectId),
  deleteAsset: (assetId) => ipcRenderer.invoke('asset:delete', assetId),
  optimizeAsset: (assetId, options) => ipcRenderer.invoke('asset:optimize', assetId, options),

  // Template operations
  getTemplates: () => ipcRenderer.invoke('template:getAll'),
  getTemplate: (templateId) => ipcRenderer.invoke('template:get', templateId),
  createTemplate: (data) => ipcRenderer.invoke('template:create', data),
  deleteTemplate: (templateId) => ipcRenderer.invoke('template:delete', templateId),

  // Color palette operations
  getColorPalettes: () => ipcRenderer.invoke('palette:getAll'),
  createColorPalette: (data) => ipcRenderer.invoke('palette:create', data),
  updateColorPalette: (paletteId, data) => ipcRenderer.invoke('palette:update', paletteId, data),
  deleteColorPalette: (paletteId) => ipcRenderer.invoke('palette:delete', paletteId),

  // File system operations
  showOpenDialog: (options) => ipcRenderer.invoke('dialog:showOpen', options),
  showSaveDialog: (options) => ipcRenderer.invoke('dialog:showSave', options),
  showMessageBox: (options) => ipcRenderer.invoke('dialog:showMessage', options),

  // PDF operations
  generatePDF: (projectId, options) => ipcRenderer.invoke('pdf:generate', projectId, options),
  previewPage: (pageId) => ipcRenderer.invoke('pdf:preview', pageId),

  // Application operations
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  getAppSettings: () => ipcRenderer.invoke('app:getSettings'),
  updateAppSettings: (settings) => ipcRenderer.invoke('app:updateSettings', settings),

  // Event listeners
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-new-project', () => callback('new-project'));
    ipcRenderer.on('menu-open-project', (event, filePath) => callback('open-project', filePath));
    ipcRenderer.on('menu-save-project', () => callback('save-project'));
  },

  onWindowStateChange: (callback) => {
    ipcRenderer.on('window-maximized', () => callback('maximized'));
    ipcRenderer.on('window-unmaximized', () => callback('unmaximized'));
  },

  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },

  // Generic IPC invoke
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
};

// Expose the API to the global window object
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Expose a flag to identify that we're in Electron
contextBridge.exposeInMainWorld('isElectron', true);

// Development utilities (only in dev mode)
if (process.env.NODE_ENV === 'development') {
  contextBridge.exposeInMainWorld('electronDev', {
    openDevTools: () => ipcRenderer.invoke('dev:openDevTools'),
    reloadWindow: () => ipcRenderer.invoke('dev:reloadWindow'),
  });
}

console.log('Preload script loaded successfully');