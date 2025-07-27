# PDF Book Editor

Una aplicación de escritorio Linux de código abierto para crear y editar libros con estilizado personalizado, generación de PDF profesional y sistema de plantillas.

## 🚀 Características

- **Aplicación Nativa Linux**: Desarrollada con Electron para máximo rendimiento
- **Editor Visual WYSIWYG**: Interfaz drag & drop para elementos de página
- **Editor de Código**: Monaco Editor con soporte completo HTML/CSS
- **Gestión de Imágenes**: Procesamiento multi-resolución con posicionamiento preciso
- **Generación PDF**: Conversión de alta fidelidad para impresión profesional
- **Sistema de Plantillas**: Biblioteca local con templates para diferentes tipos de libros
- **Paletas de Colores**: Sistema temático para ambientación narrativa
- **Offline-First**: Funciona completamente sin conexión a internet
- **Auto-guardado**: Backup automático y sistema de versiones
- **Código Abierto**: Licencia GPL v3, contribuciones de la comunidad

## 🛠️ Stack Tecnológico

### Aplicación Desktop
- **Framework**: Electron + React 18 + TypeScript
- **UI**: Tailwind CSS + Headless UI + Lucide Icons
- **Editor**: Monaco Editor (motor de VS Code)
- **Canvas**: Fabric.js + Konva.js para manipulación visual
- **Base de Datos**: SQLite3 + better-sqlite3 (almacenamiento local)
- **PDF**: Puppeteer + html2canvas
- **Imágenes**: Sharp para procesamiento y optimización
- **Build**: Electron Builder para distribuciones Linux

## 📦 Instalación

### Para Usuarios (Binarios)

#### Ubuntu/Debian
```bash
# Instalar desde repositorio APT
sudo add-apt-repository ppa:pdfbookeditor/stable
sudo apt update
sudo apt install pdfbook-editor
```

#### Distribuciones Universales
```bash
# Descargar AppImage desde GitHub Releases
wget https://github.com/pdfbook-editor/releases/latest/pdfbook-editor.AppImage
chmod +x pdfbook-editor.AppImage
./pdfbook-editor.AppImage
```

#### Desde Código Fuente
```bash
# Clonar repositorio
git clone https://github.com/pdfbook-editor/pdfbook-editor.git
cd pdfbook-editor

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para distribución
npm run build:linux
```

## 🔧 Configuración

### Directorios de Datos
La aplicación utiliza directorios estándar de Linux:

- **Configuración**: `~/.config/pdfbook-editor/`
- **Base de Datos**: `~/.config/pdfbook-editor/database.sqlite`
- **Templates**: `~/.local/share/pdfbook-editor/templates/`
- **Proyectos**: Por defecto en `~/Documents/PDFBooks/`
- **Cache**: `~/.cache/pdfbook-editor/`

### Primer Arranque
La aplicación se auto-configura en el primer arranque:
1. Crea directorios necesarios
2. Inicializa base de datos SQLite
3. Instala templates predeterminados
4. Configura preferencias por defecto

## 🚀 Uso

### Desarrollo
```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (hot reload)
npm run dev

# Ejecutar tests
npm test

# Linting y formato
npm run lint
npm run format
```

### Build para Distribución
```bash
# Build completo para Linux
npm run build:linux

# Solo .deb (Ubuntu/Debian)
npm run build:deb

# Solo AppImage (Universal)
npm run build:appimage

# Build de desarrollo
npm run build:dev
```

## 📁 Estructura del Proyecto

```
pdfbook-editor/
├── package.json                    # Configuración principal Electron
├── electron/
│   ├── main.ts                     # Proceso principal Electron
│   ├── preload.ts                  # Bridge seguro renderer ↔ main
│   └── ipc/                        # Canales IPC
├── src/
│   ├── renderer/                   # Frontend React (proceso renderer)
│   │   ├── components/             # Componentes React
│   │   ├── pages/                  # Páginas de la aplicación
│   │   ├── hooks/                  # Custom hooks
│   │   ├── services/               # Servicios de frontend
│   │   └── types/                  # Tipos TypeScript
│   ├── main/                       # Backend Electron (proceso main)
│   │   ├── database/               # Gestión SQLite
│   │   ├── services/               # Servicios de backend
│   │   ├── pdf-generator/          # Motor de generación PDF
│   │   └── file-system/            # Gestión de archivos
│   └── shared/                     # Código compartido
│       └── types/                  # Tipos compartidos
├── assets/
│   ├── icons/                      # Iconos de la aplicación
│   ├── templates/                  # Templates predeterminados
│   └── fonts/                      # Fuentes incluidas
├── scripts/
│   ├── build-linux.sh             # Script de build Linux
│   └── package-deb.sh             # Script de empaquetado .deb
├── tests/                          # Suite de tests
│   ├── unit/                       # Tests unitarios
│   ├── integration/                # Tests de integración
│   └── e2e/                        # Tests end-to-end
└── dist/                           # Builds finales
```

## 🏗️ Arquitectura de la Aplicación

### Procesos Electron
- **Main Process**: Gestiona ventanas, IPC, base de datos, sistema de archivos
- **Renderer Process**: Interfaz de usuario React con acceso limitado al sistema
- **Preload Script**: Bridge seguro entre renderer y main con APIs expuestas

### Comunicación IPC
```typescript
// Canales principales de comunicación
'project:create', 'project:open', 'project:save'
'page:create', 'page:update', 'page:delete'
'asset:import', 'asset:optimize', 'asset:delete'
'pdf:generate', 'pdf:export', 'pdf:preview'
'file:dialog', 'file:watch', 'file:backup'
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests unitarios
npm run test:unit

# Tests de integración
npm run test:integration

# Tests E2E con Electron
npm run test:e2e

# Coverage de código
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### Tipos de Tests
- **Unit Tests**: Jest + Testing Library para componentes React
- **Integration Tests**: Tests de servicios e IPC communication
- **E2E Tests**: Spectron/Playwright para flujos completos de usuario
- **PDF Tests**: Verificación de generación PDF con muestras específicas

## 🎯 Casos de Uso Principales

### Para Escritores
- **Novelas**: Templates elegantes con tipografía optimizada para lectura
- **Cuentos**: Layouts compactos con énfasis en narrativa
- **Poesía**: Espaciado especial y tipografía artística

### Para Autores Infantiles
- **Cuentos Ilustrados**: Templates con grandes espacios para imágenes
- **Libros Educativos**: Layouts didácticos con colores alegres
- **Comics**: Plantillas de viñetas y globos de diálogo

### Para Editores
- **Manuales Técnicos**: Estructuras formales con tablas y diagramas
- **Libros de Texto**: Layouts académicos con notas y referencias
- **Documentación**: Templates profesionales para empresas

## 📋 Roadmap v1.0

### Fase Actual: Core Features
- [x] Aplicación Electron básica
- [x] Editor visual con drag & drop
- [x] Sistema de plantillas
- [x] Generación PDF básica
- [ ] Sistema de paletas de colores
- [ ] Gestión avanzada de imágenes
- [ ] Auto-guardado y versionado

### Futuras Versiones
- **v1.1**: Exportación ePub y formatos adicionales
- **v1.2**: Plantillas comunitarias y marketplace
- **v1.3**: Plugins y extensiones
- **v1.4**: Sincronización en la nube (opcional)
- **v2.0**: Colaboración y comentarios

## 🤝 Contribución

### Para Desarrolladores
1. Fork el repositorio en GitHub
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Seguir guías de estilo (ESLint + Prettier configurados)
4. Escribir tests para nuevas funcionalidades
5. Commit con mensajes descriptivos
6. Push y crear Pull Request

### Para Diseñadores
- Contribuir templates en `assets/templates/`
- Crear paletas de colores temáticas
- Mejorar UX/UI de la aplicación
- Diseñar iconos y assets gráficos

### Para Escritores
- Reportar bugs y sugerir mejoras
- Crear contenido de documentación
- Traducir la aplicación a otros idiomas
- Compartir casos de uso y workflows

## 📄 Licencia

**GPL v3** - Software libre y de código abierto

- ✅ Uso personal y comercial
- ✅ Modificación y distribución
- ✅ Contribuciones de la comunidad
- ❌ Uso en software propietario sin liberar código

Ver el archivo [LICENSE](LICENSE) para detalles completos.