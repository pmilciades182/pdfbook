# Plan de Testing Detallado - PDF Book Editor

## 📋 Resumen de Testing

### Tipos de Tests
- **Unit Tests**: Tests de funciones individuales y componentes
- **Integration Tests**: Tests de comunicación entre servicios
- **E2E Tests**: Tests de flujos completos de usuario
- **Performance Tests**: Tests de rendimiento y carga
- **Security Tests**: Tests de seguridad y validación

### Herramientas de Testing
- **Jest**: Framework de testing principal
- **React Testing Library**: Testing de componentes React
- **Electron Testing**: Spectron/Playwright para E2E
- **SQLite Testing**: Tests de base de datos en memoria
- **PDF Testing**: Verificación de salida PDF

---

## Fase 1: Estructura del Proyecto - Tests

### Unit Tests - Configuración Inicial

#### test-1.1: Configuración Electron
```typescript
// tests/unit/electron-config.test.ts
describe('Electron Configuration', () => {
  test('should initialize main process correctly', () => {
    // Verificar que Electron main se inicializa sin errores
  });
  
  test('should set up IPC channels', () => {
    // Verificar que los canales IPC se configuran correctamente
  });
  
  test('should create application window', () => {
    // Verificar que la ventana principal se crea con configuraciones correctas
  });
});
```

#### test-1.2: TypeScript Configuration
```typescript
// tests/unit/typescript-config.test.ts
describe('TypeScript Configuration', () => {
  test('should compile without errors', () => {
    // Verificar compilación TypeScript
  });
  
  test('should have correct type definitions', () => {
    // Verificar tipos compartidos entre main y renderer
  });
});
```

#### test-1.3: Build System
```typescript
// tests/unit/build-system.test.ts
describe('Build System', () => {
  test('should build for development', () => {
    // Verificar build de desarrollo
  });
  
  test('should build for production', () => {
    // Verificar build de producción
  });
  
  test('should create .deb package', () => {
    // Verificar creación de paquete .deb
  });
  
  test('should create AppImage', () => {
    // Verificar creación de AppImage
  });
});
```

### Integration Tests - Fase 1

#### test-1.4: Electron Processes Communication
```typescript
// tests/integration/electron-ipc.test.ts
describe('IPC Communication', () => {
  test('should communicate between main and renderer', async () => {
    // Verificar comunicación bidireccional IPC
  });
  
  test('should handle IPC errors gracefully', async () => {
    // Verificar manejo de errores en IPC
  });
});
```

---

## Fase 2: Base de Datos - Tests

### Unit Tests - Database Schema

#### test-2.1: Database Initialization
```typescript
// tests/unit/database/initialization.test.ts
describe('Database Initialization', () => {
  let db: Database;
  
  beforeEach(() => {
    db = new Database(':memory:');
  });
  
  test('should create all required tables', () => {
    const tables = db.getAllTables();
    expect(tables).toContain('projects');
    expect(tables).toContain('pages');
    expect(tables).toContain('assets');
    expect(tables).toContain('templates');
    expect(tables).toContain('color_palettes');
    expect(tables).toContain('app_settings');
    expect(tables).toContain('project_versions');
  });
  
  test('should create proper indexes', () => {
    const indexes = db.getAllIndexes();
    expect(indexes).toContain('idx_projects_last_accessed');
    expect(indexes).toContain('idx_pages_project_id');
    expect(indexes).toContain('idx_assets_project_id');
  });
});
```

#### test-2.2: Project CRUD Operations
```typescript
// tests/unit/database/project-crud.test.ts
describe('Project CRUD Operations', () => {
  let projectService: ProjectService;
  
  beforeEach(() => {
    const db = new Database(':memory:');
    projectService = new ProjectService(db);
  });
  
  test('should create new project', async () => {
    const project = await projectService.create({
      name: 'Test Book',
      description: 'Test Description',
      page_format: 'A4'
    });
    
    expect(project.id).toBeDefined();
    expect(project.name).toBe('Test Book');
    expect(project.page_format).toBe('A4');
  });
  
  test('should read project by id', async () => {
    const created = await projectService.create({ name: 'Test Book' });
    const retrieved = await projectService.getById(created.id);
    
    expect(retrieved).toEqual(created);
  });
  
  test('should update project', async () => {
    const project = await projectService.create({ name: 'Test Book' });
    const updated = await projectService.update(project.id, { 
      name: 'Updated Book' 
    });
    
    expect(updated.name).toBe('Updated Book');
    expect(updated.updated_at).not.toBe(project.updated_at);
  });
  
  test('should delete project', async () => {
    const project = await projectService.create({ name: 'Test Book' });
    await projectService.delete(project.id);
    
    const retrieved = await projectService.getById(project.id);
    expect(retrieved).toBeNull();
  });
});
```

#### test-2.3: Version History
```typescript
// tests/unit/database/version-history.test.ts
describe('Version History', () => {
  let versionService: VersionService;
  
  test('should create version snapshot', async () => {
    const version = await versionService.createSnapshot(projectId, {
      description: 'Test snapshot',
      data: projectData
    });
    
    expect(version.version_number).toBe(1);
    expect(version.description).toBe('Test snapshot');
  });
  
  test('should retrieve version history', async () => {
    await versionService.createSnapshot(projectId, { data: 'v1' });
    await versionService.createSnapshot(projectId, { data: 'v2' });
    
    const history = await versionService.getHistory(projectId);
    expect(history).toHaveLength(2);
    expect(history[0].version_number).toBe(2); // Latest first
  });
  
  test('should restore from version', async () => {
    const v1 = await versionService.createSnapshot(projectId, { data: 'v1' });
    await versionService.createSnapshot(projectId, { data: 'v2' });
    
    const restored = await versionService.restoreVersion(v1.id);
    expect(restored.data).toBe('v1');
  });
});
```

### Integration Tests - Fase 2

#### test-2.4: Database Migration
```typescript
// tests/integration/database-migration.test.ts
describe('Database Migration', () => {
  test('should migrate from v1 to v2', async () => {
    // Crear DB v1, ejecutar migración, verificar esquema v2
  });
  
  test('should handle migration rollback', async () => {
    // Verificar rollback en caso de error de migración
  });
});
```

---

## Fase 3: Servicios Backend - Tests

### Unit Tests - Main Process Services

#### test-3.1: Project Service
```typescript
// tests/unit/services/project-service.test.ts
describe('ProjectService', () => {
  let projectService: ProjectService;
  
  test('should create project with template', async () => {
    const project = await projectService.createProject('My Book', 'novel-template');
    
    expect(project.name).toBe('My Book');
    expect(project.pages).toHaveLength(3); // Template pages
  });
  
  test('should export project to PDF', async () => {
    const pdfBuffer = await projectService.exportToPDF(projectId);
    
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(1000);
  });
  
  test('should save project to .pdfbook format', async () => {
    const filePath = await projectService.saveToFile(projectId, '/tmp/test.pdfbook');
    
    expect(fs.existsSync(filePath)).toBe(true);
    const stats = fs.statSync(filePath);
    expect(stats.size).toBeGreaterThan(0);
  });
});
```

#### test-3.2: Page Service
```typescript
// tests/unit/services/page-service.test.ts
describe('PageService', () => {
  let pageService: PageService;
  
  test('should create page with template', async () => {
    const page = await pageService.createPage(projectId, 'chapter-template');
    
    expect(page.project_id).toBe(projectId);
    expect(page.html_content).toContain('<!-- chapter template -->');
  });
  
  test('should update page content', async () => {
    const page = await pageService.createPage(projectId);
    const updated = await pageService.updateContent(page.id, {
      html_content: '<h1>New Content</h1>',
      css_styles: 'h1 { color: blue; }'
    });
    
    expect(updated.html_content).toBe('<h1>New Content</h1>');
    expect(updated.css_styles).toBe('h1 { color: blue; }');
  });
  
  test('should reorder pages', async () => {
    const page1 = await pageService.createPage(projectId);
    const page2 = await pageService.createPage(projectId);
    const page3 = await pageService.createPage(projectId);
    
    await pageService.reorderPages(projectId, [page3.id, page1.id, page2.id]);
    
    const pages = await pageService.getProjectPages(projectId);
    expect(pages[0].id).toBe(page3.id);
    expect(pages[1].id).toBe(page1.id);
    expect(pages[2].id).toBe(page2.id);
  });
});
```

#### test-3.3: Asset Service
```typescript
// tests/unit/services/asset-service.test.ts
describe('AssetService', () => {
  let assetService: AssetService;
  
  test('should import and optimize image', async () => {
    const imagePath = path.join(__dirname, 'fixtures/test-image.jpg');
    const asset = await assetService.importImage(imagePath, projectId);
    
    expect(asset.mime_type).toBe('image/jpeg');
    expect(asset.width).toBeDefined();
    expect(asset.height).toBeDefined();
    expect(asset.file_size).toBeLessThan(1024 * 1024); // < 1MB after optimization
  });
  
  test('should generate thumbnails', async () => {
    const asset = await assetService.importImage(imagePath, projectId);
    const thumbnail = await assetService.generateThumbnail(asset.id, { width: 150, height: 150 });
    
    expect(thumbnail.width).toBe(150);
    expect(thumbnail.height).toBe(150);
  });
  
  test('should delete asset and cleanup', async () => {
    const asset = await assetService.importImage(imagePath, projectId);
    await assetService.deleteAsset(asset.id);
    
    const retrieved = await assetService.getAsset(asset.id);
    expect(retrieved).toBeNull();
  });
});
```

### Integration Tests - Fase 3

#### test-3.4: IPC Service Communication
```typescript
// tests/integration/ipc-services.test.ts
describe('IPC Service Communication', () => {
  test('should handle project operations via IPC', async () => {
    const result = await ipcRenderer.invoke('project:create', {
      name: 'Test Book',
      template: 'novel'
    });
    
    expect(result.success).toBe(true);
    expect(result.project.name).toBe('Test Book');
  });
  
  test('should handle file operations via IPC', async () => {
    const filePaths = await ipcRenderer.invoke('file:openDialog', {
      filters: [{ name: 'Images', extensions: ['jpg', 'png'] }],
      properties: ['openFile', 'multiSelections']
    });
    
    expect(Array.isArray(filePaths)).toBe(true);
  });
});
```

---

## Fase 4: Frontend Foundation - Tests

### Unit Tests - React Components

#### test-4.1: Layout Components
```typescript
// tests/unit/components/AppLayout.test.tsx
import { render, screen } from '@testing-library/react';
import { AppLayout } from '@/components/AppLayout';

describe('AppLayout', () => {
  test('should render main layout structure', () => {
    render(<AppLayout />);
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('complementary')).toBeInTheDocument(); // sidebar
  });
  
  test('should toggle sidebar visibility', async () => {
    const user = userEvent.setup();
    render(<AppLayout />);
    
    const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i });
    await user.click(toggleButton);
    
    expect(screen.getByRole('complementary')).toHaveClass('hidden');
  });
});
```

#### test-4.2: Project Components
```typescript
// tests/unit/components/ProjectDashboard.test.tsx
describe('ProjectDashboard', () => {
  test('should display recent projects', async () => {
    const mockProjects = [
      { id: 1, name: 'Book 1', last_accessed: '2024-01-01' },
      { id: 2, name: 'Book 2', last_accessed: '2024-01-02' }
    ];
    
    mockIPC('project:getRecent', mockProjects);
    
    render(<ProjectDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Book 1')).toBeInTheDocument();
      expect(screen.getByText('Book 2')).toBeInTheDocument();
    });
  });
  
  test('should handle create new project', async () => {
    const user = userEvent.setup();
    render(<ProjectDashboard />);
    
    const createButton = screen.getByRole('button', { name: /new project/i });
    await user.click(createButton);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
```

#### test-4.3: Editor Components
```typescript
// tests/unit/components/PageCanvas.test.tsx
describe('PageCanvas', () => {
  test('should render canvas with zoom controls', () => {
    render(<PageCanvas pageId={1} />);
    
    expect(screen.getByRole('main')).toHaveClass('canvas-container');
    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
  });
  
  test('should handle element selection', async () => {
    const user = userEvent.setup();
    render(<PageCanvas pageId={1} />);
    
    const element = screen.getByTestId('canvas-element-1');
    await user.click(element);
    
    expect(element).toHaveClass('selected');
  });
});
```

### Integration Tests - Fase 4

#### test-4.4: State Management
```typescript
// tests/integration/state-management.test.ts
describe('State Management', () => {
  test('should manage project state correctly', () => {
    const { result } = renderHook(() => useProjectStore());
    
    act(() => {
      result.current.setCurrentProject({ id: 1, name: 'Test Book' });
    });
    
    expect(result.current.currentProject?.name).toBe('Test Book');
  });
  
  test('should persist state across components', () => {
    // Test state persistence and hydration
  });
});
```

---

## Fase 5: Editor Visual - Tests

### Unit Tests - Drag & Drop

#### test-5.1: Drag and Drop Functionality
```typescript
// tests/unit/editor/drag-drop.test.tsx
describe('Drag and Drop', () => {
  test('should handle element dragging', async () => {
    const user = userEvent.setup();
    render(<PageCanvas />);
    
    const element = screen.getByTestId('draggable-text');
    const dropZone = screen.getByTestId('drop-zone');
    
    await user.dragAndDrop(element, dropZone);
    
    expect(dropZone).toContainElement(element);
  });
  
  test('should update element position', async () => {
    const mockUpdatePosition = jest.fn();
    render(<DraggableElement onPositionChange={mockUpdatePosition} />);
    
    // Simulate drag to new position
    fireEvent.dragEnd(screen.getByTestId('draggable-element'), {
      clientX: 100,
      clientY: 200
    });
    
    expect(mockUpdatePosition).toHaveBeenCalledWith({ x: 100, y: 200 });
  });
});
```

#### test-5.2: Element Manipulation
```typescript
// tests/unit/editor/element-manipulation.test.tsx
describe('Element Manipulation', () => {
  test('should resize element with handles', async () => {
    const user = userEvent.setup();
    render(<ResizableElement />);
    
    const resizeHandle = screen.getByTestId('resize-handle-se');
    
    await user.pointer([
      { keys: '[MouseLeft>]', target: resizeHandle },
      { coords: { x: 50, y: 50 } },
      { keys: '[/MouseLeft]' }
    ]);
    
    expect(screen.getByTestId('element')).toHaveStyle({
      width: '150px',
      height: '150px'
    });
  });
  
  test('should rotate element', async () => {
    const user = userEvent.setup();
    render(<RotatableElement />);
    
    const rotateHandle = screen.getByTestId('rotate-handle');
    
    // Simulate rotation gesture
    await user.pointer([
      { keys: '[MouseLeft>]', target: rotateHandle },
      { coords: { x: 45 } }, // 45 degree rotation
      { keys: '[/MouseLeft]' }
    ]);
    
    expect(screen.getByTestId('element')).toHaveStyle({
      transform: 'rotate(45deg)'
    });
  });
});
```

### Performance Tests - Fase 5

#### test-5.3: Canvas Performance
```typescript
// tests/performance/canvas-performance.test.ts
describe('Canvas Performance', () => {
  test('should handle many elements without lag', () => {
    const startTime = performance.now();
    
    render(<PageCanvas elements={Array(1000).fill(null).map((_, i) => ({
      id: i,
      type: 'text',
      content: `Element ${i}`
    }))} />);
    
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(1000); // < 1 second
  });
  
  test('should maintain 60fps during interactions', async () => {
    // Test frame rate during drag operations
  });
});
```

---

## Fase 6: Gestión de Assets - Tests

### Unit Tests - Image Processing

#### test-6.1: Image Import and Processing
```typescript
// tests/unit/assets/image-processing.test.ts
describe('Image Processing', () => {
  test('should process JPEG image', async () => {
    const imagePath = path.join(__dirname, 'fixtures/test.jpg');
    const processed = await imageProcessor.process(imagePath, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 85
    });
    
    expect(processed.format).toBe('jpeg');
    expect(processed.width).toBeLessThanOrEqual(1920);
    expect(processed.height).toBeLessThanOrEqual(1080);
  });
  
  test('should generate multiple resolutions', async () => {
    const resolutions = await imageProcessor.generateResolutions(imagePath, [
      { width: 300, height: 200, suffix: 'thumb' },
      { width: 800, height: 600, suffix: 'medium' },
      { width: 1920, height: 1080, suffix: 'large' }
    ]);
    
    expect(resolutions).toHaveLength(3);
    expect(resolutions[0].width).toBe(300);
    expect(resolutions[1].width).toBe(800);
    expect(resolutions[2].width).toBe(1920);
  });
});
```

#### test-6.2: Asset Management
```typescript
// tests/unit/assets/asset-management.test.ts
describe('Asset Management', () => {
  test('should track asset usage in project', async () => {
    const asset = await assetService.importImage(imagePath, projectId);
    await pageService.addImageToPage(pageId, asset.id);
    
    const usage = await assetService.getAssetUsage(asset.id);
    expect(usage.pages).toContain(pageId);
    expect(usage.usageCount).toBe(1);
  });
  
  test('should prevent deletion of used assets', async () => {
    const asset = await assetService.importImage(imagePath, projectId);
    await pageService.addImageToPage(pageId, asset.id);
    
    await expect(assetService.deleteAsset(asset.id)).rejects.toThrow('Asset is in use');
  });
  
  test('should cleanup unused assets', async () => {
    const asset1 = await assetService.importImage(imagePath, projectId);
    const asset2 = await assetService.importImage(imagePath, projectId);
    
    await pageService.addImageToPage(pageId, asset1.id);
    
    const cleaned = await assetService.cleanupUnusedAssets(projectId);
    expect(cleaned).toContain(asset2.id);
    expect(cleaned).not.toContain(asset1.id);
  });
});
```

---

## Fase 7: Templates y Paletas - Tests

### Unit Tests - Template System

#### test-7.1: Template Management
```typescript
// tests/unit/templates/template-management.test.ts
describe('Template Management', () => {
  test('should load built-in templates', async () => {
    const templates = await templateService.getBuiltInTemplates();
    
    expect(templates).toContainEqual(
      expect.objectContaining({
        name: 'Novel Template',
        category: 'books',
        pages: expect.any(Array)
      })
    );
  });
  
  test('should apply template to project', async () => {
    const template = await templateService.getTemplate('novel-template');
    const project = await projectService.applyTemplate(projectId, template);
    
    expect(project.pages).toHaveLength(template.pages.length);
    expect(project.color_palette_id).toBe(template.default_palette_id);
  });
  
  test('should create custom template from project', async () => {
    const template = await templateService.createFromProject(projectId, {
      name: 'My Custom Template',
      description: 'Based on my book'
    });
    
    expect(template.name).toBe('My Custom Template');
    expect(template.pages).toHaveLength(project.pages.length);
  });
});
```

#### test-7.2: Color Palette System
```typescript
// tests/unit/templates/color-palettes.test.ts
describe('Color Palette System', () => {
  test('should create color palette', async () => {
    const palette = await colorPaletteService.create({
      name: 'Vintage Book',
      colors: ['#8B4513', '#DEB887', '#F5F5DC', '#2F4F4F'],
      theme_type: 'vintage'
    });
    
    expect(palette.colors).toHaveLength(4);
    expect(palette.theme_type).toBe('vintage');
  });
  
  test('should apply palette to project', async () => {
    const palette = await colorPaletteService.create({
      name: 'Test Palette',
      colors: ['#FF0000', '#00FF00', '#0000FF']
    });
    
    await projectService.applyColorPalette(projectId, palette.id);
    
    const project = await projectService.getById(projectId);
    expect(project.color_palette_id).toBe(palette.id);
  });
  
  test('should generate CSS variables from palette', () => {
    const cssVars = colorPaletteService.generateCSSVariables({
      colors: ['#FF0000', '#00FF00', '#0000FF'],
      name: 'Test'
    });
    
    expect(cssVars).toContain('--color-primary: #FF0000;');
    expect(cssVars).toContain('--color-secondary: #00FF00;');
    expect(cssVars).toContain('--color-accent: #0000FF;');
  });
});
```

---

## Fase 8: Personalización y Estilos - Tests

### Unit Tests - CSS Editor

#### test-8.1: Monaco Editor Integration
```typescript
// tests/unit/editor/monaco-integration.test.tsx
describe('Monaco Editor Integration', () => {
  test('should initialize with CSS language', () => {
    render(<CSSEditor />);
    
    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveAttribute('data-language', 'css');
  });
  
  test('should provide CSS autocomplete', async () => {
    const user = userEvent.setup();
    render(<CSSEditor />);
    
    const editor = screen.getByTestId('monaco-editor');
    await user.type(editor, 'h1 { col');
    
    // Simulate Ctrl+Space for autocomplete
    await user.keyboard('{Control>} {Space}');
    
    expect(screen.getByText('color')).toBeInTheDocument();
  });
  
  test('should validate CSS syntax', async () => {
    const mockOnValidation = jest.fn();
    render(<CSSEditor onValidation={mockOnValidation} />);
    
    const editor = screen.getByTestId('monaco-editor');
    await user.type(editor, 'h1 { color: invalid-color; }');
    
    expect(mockOnValidation).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'error',
          message: expect.stringContaining('invalid-color')
        })
      ])
    );
  });
});
```

#### test-8.2: Style System
```typescript
// tests/unit/styles/style-system.test.ts
describe('Style System', () => {
  test('should compile page styles', () => {
    const pageStyles = {
      global: 'body { font-family: serif; }',
      page: 'h1 { color: blue; }',
      elements: {
        'element-1': 'font-size: 18px;'
      }
    };
    
    const compiled = styleCompiler.compile(pageStyles);
    
    expect(compiled).toContain('body { font-family: serif; }');
    expect(compiled).toContain('h1 { color: blue; }');
    expect(compiled).toContain('[data-element-id="element-1"] { font-size: 18px; }');
  });
  
  test('should merge CSS with variables', () => {
    const css = 'h1 { color: var(--primary-color); }';
    const variables = { '--primary-color': '#FF0000' };
    
    const merged = styleCompiler.mergeVariables(css, variables);
    
    expect(merged).toContain('h1 { color: #FF0000; }');
  });
});
```

---

## Fase 9: Generación PDF - Tests

### Unit Tests - PDF Generation

#### test-9.1: PDF Engine
```typescript
// tests/unit/pdf/pdf-generation.test.ts
describe('PDF Generation', () => {
  test('should generate PDF from HTML', async () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head><style>h1 { color: blue; }</style></head>
        <body><h1>Test Book</h1></body>
      </html>
    `;
    
    const pdfBuffer = await pdfGenerator.generateFromHTML(html, {
      format: 'A4',
      margin: { top: '2cm', bottom: '2cm', left: '2cm', right: '2cm' }
    });
    
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(1000);
  });
  
  test('should embed images correctly', async () => {
    const html = `<img src="data:image/jpeg;base64,${imageBase64}" />`;
    const pdfBuffer = await pdfGenerator.generateFromHTML(html);
    
    // Verify PDF contains embedded image
    const pdfText = pdfBuffer.toString('binary');
    expect(pdfText).toContain('/Subtype /Image');
  });
  
  test('should respect print CSS rules', async () => {
    const html = `
      <style>
        @page { size: A4; margin: 2cm; }
        @media print { .no-print { display: none; } }
      </style>
      <div class="no-print">This should not appear in PDF</div>
      <div>This should appear in PDF</div>
    `;
    
    const pdfBuffer = await pdfGenerator.generateFromHTML(html);
    
    // PDF should not contain hidden content
    const pdfText = await extractTextFromPDF(pdfBuffer);
    expect(pdfText).not.toContain('This should not appear in PDF');
    expect(pdfText).toContain('This should appear in PDF');
  });
});
```

#### test-9.2: PDF Quality Tests
```typescript
// tests/unit/pdf/pdf-quality.test.ts
describe('PDF Quality', () => {
  test('should maintain image quality', async () => {
    const highResImage = await createTestImage(1920, 1080);
    const html = `<img src="${highResImage}" style="width: 100%; height: auto;" />`;
    
    const pdfBuffer = await pdfGenerator.generateFromHTML(html, {
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true
    });
    
    const imageData = await extractImageFromPDF(pdfBuffer);
    expect(imageData.width).toBeGreaterThanOrEqual(1200); // Reasonable quality
  });
  
  test('should handle multi-page content', async () => {
    const html = `
      ${Array(10).fill(null).map((_, i) => 
        `<div style="page-break-after: always;">Page ${i + 1} content</div>`
      ).join('')}
    `;
    
    const pdfBuffer = await pdfGenerator.generateFromHTML(html);
    const pageCount = await getPDFPageCount(pdfBuffer);
    
    expect(pageCount).toBe(10);
  });
});
```

### Integration Tests - Fase 9

#### test-9.3: End-to-End PDF Generation
```typescript
// tests/integration/pdf-e2e.test.ts
describe('End-to-End PDF Generation', () => {
  test('should generate complete book PDF', async () => {
    // Create a test project with multiple pages
    const project = await projectService.create({ name: 'Test Book' });
    
    // Add pages with content
    await pageService.createPage(project.id, {
      html_content: '<h1>Chapter 1</h1><p>Content...</p>',
      css_styles: 'h1 { color: #333; }'
    });
    
    await pageService.createPage(project.id, {
      html_content: '<h1>Chapter 2</h1><p>More content...</p>',
      css_styles: 'h1 { color: #333; }'
    });
    
    // Generate PDF
    const pdfBuffer = await projectService.generatePDF(project.id);
    
    // Verify PDF structure
    const pdfText = await extractTextFromPDF(pdfBuffer);
    expect(pdfText).toContain('Chapter 1');
    expect(pdfText).toContain('Chapter 2');
    
    const pageCount = await getPDFPageCount(pdfBuffer);
    expect(pageCount).toBeGreaterThanOrEqual(2);
  });
});
```

---

## Fase 10: Testing y Optimización - Tests

### Performance Tests

#### test-10.1: Application Performance
```typescript
// tests/performance/app-performance.test.ts
describe('Application Performance', () => {
  test('should start within 3 seconds', async () => {
    const startTime = Date.now();
    
    const app = await startElectronApp();
    await app.waitForSelector('[data-testid="app-ready"]');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
    
    await app.close();
  });
  
  test('should handle large projects efficiently', async () => {
    const project = await createLargeProject(100); // 100 pages
    
    const startTime = performance.now();
    await projectService.loadProject(project.id);
    const loadTime = performance.now() - startTime;
    
    expect(loadTime).toBeLessThan(2000); // < 2 seconds
  });
  
  test('should maintain memory usage under limits', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Perform memory-intensive operations
    for (let i = 0; i < 10; i++) {
      await projectService.generatePDF(projectId);
    }
    
    // Force garbage collection
    if (global.gc) global.gc();
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // < 100MB increase
  });
});
```

### E2E Tests

#### test-10.2: Complete User Workflows
```typescript
// tests/e2e/user-workflows.test.ts
describe('Complete User Workflows', () => {
  test('should complete book creation workflow', async () => {
    const app = await startElectronApp();
    
    // Start with dashboard
    await app.click('[data-testid="new-project-button"]');
    
    // Fill project details
    await app.fill('[data-testid="project-name"]', 'My Test Book');
    await app.selectOption('[data-testid="template-select"]', 'novel');
    await app.click('[data-testid="create-project"]');
    
    // Wait for editor to load
    await app.waitForSelector('[data-testid="page-canvas"]');
    
    // Add content to first page
    await app.click('[data-testid="text-tool"]');
    await app.click('[data-testid="canvas"]', { position: { x: 100, y: 100 } });
    await app.type('[data-testid="text-editor"]', 'Chapter 1');
    
    // Add new page
    await app.click('[data-testid="add-page-button"]');
    
    // Generate PDF
    await app.click('[data-testid="export-menu"]');
    await app.click('[data-testid="export-pdf"]');
    
    // Verify PDF was created
    await app.waitForSelector('[data-testid="export-success"]');
    
    await app.close();
  });
  
  test('should handle image import and manipulation', async () => {
    const app = await startElectronApp();
    
    // Open existing project
    await app.click('[data-testid="open-project"]');
    
    // Import image
    await app.click('[data-testid="import-asset"]');
    
    // Mock file dialog
    await app.setInputFiles('[data-testid="file-input"]', 'tests/fixtures/test-image.jpg');
    
    // Drag image to canvas
    const image = app.locator('[data-testid="asset-image"]');
    const canvas = app.locator('[data-testid="canvas"]');
    
    await image.dragTo(canvas);
    
    // Resize image
    const resizeHandle = app.locator('[data-testid="resize-handle-se"]');
    await resizeHandle.drag(resizeHandle, { targetPosition: { x: 50, y: 50 } });
    
    // Verify image was positioned
    const imageElement = app.locator('[data-testid="canvas-image"]');
    await expect(imageElement).toBeVisible();
    
    await app.close();
  });
});
```

### Security Tests

#### test-10.3: Security Validation
```typescript
// tests/security/security-validation.test.ts
describe('Security Validation', () => {
  test('should sanitize HTML content', () => {
    const maliciousHTML = '<script>alert("xss")</script><h1>Safe content</h1>';
    const sanitized = htmlSanitizer.sanitize(maliciousHTML);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('<h1>Safe content</h1>');
  });
  
  test('should validate file uploads', async () => {
    const maliciousFile = new File(['<script>alert("xss")</script>'], 'evil.svg', {
      type: 'image/svg+xml'
    });
    
    await expect(assetService.importFile(maliciousFile, projectId))
      .rejects.toThrow('File contains potentially dangerous content');
  });
  
  test('should prevent path traversal in file operations', async () => {
    const maliciousPath = '../../../etc/passwd';
    
    await expect(fileService.readFile(maliciousPath))
      .rejects.toThrow('Invalid file path');
  });
});
```

---

## 📊 Test Coverage Requirements

### Coverage Targets
- **Overall Coverage**: Minimum 85%
- **Critical Paths**: 95% (PDF generation, data persistence)
- **UI Components**: 80%
- **Service Layer**: 90%
- **IPC Communication**: 100%

### Test Execution Strategy
```bash
# Development workflow
npm run test:watch           # Durante desarrollo
npm run test:unit           # Tests rápidos
npm run test:integration    # Tests de servicios
npm run test:e2e           # Tests completos

# CI/CD pipeline
npm run test:ci            # Todos los tests con coverage
npm run test:performance   # Tests de rendimiento
npm run test:security      # Tests de seguridad
```

### Test Data Management
- **Fixtures**: Datos de prueba estáticos en `tests/fixtures/`
- **Factories**: Generadores de datos de prueba dinámicos
- **Mocks**: IPC mocks y service mocks
- **Test Databases**: SQLite en memoria para tests de DB

Esta estrategia de testing asegura la calidad y estabilidad de la aplicación en todas las fases de desarrollo.