import { Menu, MenuItemConstructorOptions, app, shell } from 'electron';

interface MenuCallbacks {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onQuit: () => void;
}

export function createApplicationMenu(callbacks: MenuCallbacks): Menu {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: callbacks.onNew,
        },
        {
          label: 'Open Project...',
          accelerator: 'CmdOrCtrl+O',
          click: callbacks.onOpen,
        },
        {
          type: 'separator',
        },
        {
          label: 'Save Project',
          accelerator: 'CmdOrCtrl+S',
          click: callbacks.onSave,
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            // TODO: Implement save as functionality
          },
        },
        {
          type: 'separator',
        },
        {
          label: 'Export as PDF...',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            // TODO: Implement PDF export
          },
        },
        {
          type: 'separator',
        },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: callbacks.onQuit,
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo',
        },
        {
          label: 'Redo',
          accelerator: 'CmdOrCtrl+Shift+Z',
          role: 'redo',
        },
        {
          type: 'separator',
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut',
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy',
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste',
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectAll',
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            // TODO: Implement zoom functionality
          },
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            // TODO: Implement zoom functionality
          },
        },
        {
          label: 'Reset Zoom',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            // TODO: Implement zoom reset
          },
        },
        {
          type: 'separator',
        },
        {
          label: 'Toggle Sidebar',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            // TODO: Implement sidebar toggle
          },
        },
        {
          label: 'Toggle Property Panel',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            // TODO: Implement property panel toggle
          },
        },
        {
          type: 'separator',
        },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          role: 'reload',
        },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          role: 'forceReload',
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          role: 'toggleDevTools',
        },
        {
          type: 'separator',
        },
        {
          label: 'Actual Size',
          accelerator: 'CmdOrCtrl+0',
          role: 'resetZoom',
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          role: 'zoomIn',
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          role: 'zoomOut',
        },
        {
          type: 'separator',
        },
        {
          label: 'Toggle Fullscreen',
          accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
          role: 'togglefullscreen',
        },
      ],
    },
    {
      label: 'Insert',
      submenu: [
        {
          label: 'Text Box',
          accelerator: 'T',
          click: () => {
            // TODO: Implement text insertion
          },
        },
        {
          label: 'Image...',
          accelerator: 'I',
          click: () => {
            // TODO: Implement image insertion
          },
        },
        {
          label: 'Shape',
          submenu: [
            {
              label: 'Rectangle',
              click: () => {
                // TODO: Implement rectangle insertion
              },
            },
            {
              label: 'Circle',
              click: () => {
                // TODO: Implement circle insertion
              },
            },
            {
              label: 'Line',
              click: () => {
                // TODO: Implement line insertion
              },
            },
          ],
        },
        {
          type: 'separator',
        },
        {
          label: 'New Page',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => {
            // TODO: Implement new page insertion
          },
        },
      ],
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Template Manager',
          click: () => {
            // TODO: Open template manager
          },
        },
        {
          label: 'Color Palette Manager',
          click: () => {
            // TODO: Open color palette manager
          },
        },
        {
          type: 'separator',
        },
        {
          label: 'Preferences',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            // TODO: Open preferences
          },
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About PDF Book Editor',
          click: () => {
            // TODO: Show about dialog
          },
        },
        {
          label: 'User Guide',
          click: () => {
            shell.openExternal('https://github.com/pmilciades182/pdfbook#readme');
          },
        },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/pmilciades182/pdfbook/issues');
          },
        },
        {
          type: 'separator',
        },
        {
          label: 'Check for Updates',
          click: () => {
            // TODO: Implement update checking
          },
        },
      ],
    },
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {
          label: 'About ' + app.getName(),
          role: 'about',
        },
        {
          type: 'separator',
        },
        {
          label: 'Services',
          role: 'services',
          submenu: [],
        },
        {
          type: 'separator',
        },
        {
          label: 'Hide ' + app.getName(),
          accelerator: 'Command+H',
          role: 'hide',
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          role: 'hideOthers',
        },
        {
          label: 'Show All',
          role: 'unhide',
        },
        {
          type: 'separator',
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: callbacks.onQuit,
        },
      ],
    });

    // Window menu for macOS
    template.push({
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          role: 'minimize',
        },
        {
          label: 'Close',
          accelerator: 'Command+W',
          role: 'close',
        },
      ],
    });
  }

  return Menu.buildFromTemplate(template);
}