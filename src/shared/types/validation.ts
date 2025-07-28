import { z } from 'zod';

// Project validation schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  page_format: z.enum(['A4', 'A3', 'A5', 'Letter', 'Legal', 'Custom']).default('A4'),
  page_orientation: z.enum(['portrait', 'landscape']).default('portrait'),
  margins: z.string().default('{"top":20,"bottom":20,"left":20,"right":20}'),
  color_palette_id: z.number().int().positive().optional()
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  page_format: z.enum(['A4', 'A3', 'A5', 'Letter', 'Legal', 'Custom']).optional(),
  page_orientation: z.enum(['portrait', 'landscape']).optional(),
  margins: z.string().optional(),
  color_palette_id: z.number().int().positive().optional(),
  last_export_path: z.string().optional()
});

// Page validation schemas
export const createPageSchema = z.object({
  project_id: z.number().int().positive('Invalid project ID'),
  page_number: z.number().int().positive().optional(),
  name: z.string().max(255, 'Page name too long').default('Page'),
  html_content: z.string().default(''),
  css_styles: z.string().default(''),
  template_id: z.number().int().positive().optional(),
  page_config: z.string().default('{}')
});

export const updatePageSchema = z.object({
  name: z.string().max(255, 'Page name too long').optional(),
  html_content: z.string().optional(),
  css_styles: z.string().optional(),
  template_id: z.number().int().positive().optional(),
  page_config: z.string().optional()
});

// Asset validation schemas
export const createAssetSchema = z.object({
  project_id: z.number().int().positive('Invalid project ID'),
  filename: z.string().min(1, 'Filename is required').max(255, 'Filename too long'),
  original_name: z.string().min(1, 'Original name is required').max(255, 'Original name too long'),
  mime_type: z.string().min(1, 'MIME type is required'),
  file_size: z.number().int().nonnegative('File size must be non-negative'),
  file_data: z.instanceof(Buffer, { message: 'File data must be a Buffer' }),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  thumbnail: z.instanceof(Buffer).optional()
});

// Template validation schemas
export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(255, 'Template name too long'),
  category: z.string().max(100, 'Category name too long').default('general'),
  html_template: z.string().min(1, 'HTML template is required'),
  css_template: z.string().min(1, 'CSS template is required'),
  preview_image: z.instanceof(Buffer).optional(),
  description: z.string().max(1000, 'Description too long').optional()
});

// Color palette validation schemas
export const createColorPaletteSchema = z.object({
  name: z.string().min(1, 'Palette name is required').max(255, 'Palette name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  colors: z.string().min(1, 'Colors are required'),
  theme_type: z.string().max(50, 'Theme type too long').default('custom'),
  is_default: z.boolean().default(false)
});

// Project version validation schemas
export const createProjectVersionSchema = z.object({
  project_id: z.number().int().positive('Invalid project ID'),
  version_number: z.number().int().positive('Version number must be positive'),
  description: z.string().max(255, 'Description too long').default('Auto-save'),
  data_snapshot: z.string().optional(),
  file_size: z.number().int().nonnegative().optional()
});

// Settings validation schema
export const appSettingSchema = z.object({
  key: z.string().min(1, 'Setting key is required').max(255, 'Key too long'),
  value: z.string().max(2000, 'Value too long').optional()
});

// Utility validation schemas
export const marginsSchema = z.object({
  top: z.number().nonnegative('Top margin must be non-negative'),
  bottom: z.number().nonnegative('Bottom margin must be non-negative'),
  left: z.number().nonnegative('Left margin must be non-negative'),
  right: z.number().nonnegative('Right margin must be non-negative')
});

export const pageConfigSchema = z.object({
  background_color: z.string().optional(),
  custom_css: z.string().optional(),
  print_settings: z.any().optional()
});

export const colorsArraySchema = z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'));

// ID validation
export const idSchema = z.number().int().positive('Invalid ID');

// Pagination validation
export const paginationSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  orderBy: z.string().max(50).optional(),
  direction: z.enum(['ASC', 'DESC']).optional()
});

// File validation
export const fileValidationSchema = z.object({
  filename: z.string().min(1).max(255),
  size: z.number().int().nonnegative().max(50 * 1024 * 1024), // 50MB max
  mimetype: z.string().min(1)
});

export const imageFileSchema = fileValidationSchema.extend({
  mimetype: z.string().regex(/^image\/(jpeg|jpg|png|gif|webp|svg\+xml)$/, 'Invalid image type')
});

// Export commonly used schemas
export const validationSchemas = {
  project: {
    create: createProjectSchema,
    update: updateProjectSchema
  },
  page: {
    create: createPageSchema,
    update: updatePageSchema
  },
  asset: {
    create: createAssetSchema
  },
  template: {
    create: createTemplateSchema
  },
  colorPalette: {
    create: createColorPaletteSchema
  },
  projectVersion: {
    create: createProjectVersionSchema
  },
  appSetting: appSettingSchema,
  id: idSchema,
  pagination: paginationSchema,
  margins: marginsSchema,
  pageConfig: pageConfigSchema,
  colorsArray: colorsArraySchema,
  file: fileValidationSchema,
  imageFile: imageFileSchema
};