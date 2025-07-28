"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationSchemas = exports.imageFileSchema = exports.fileValidationSchema = exports.paginationSchema = exports.idSchema = exports.colorsArraySchema = exports.pageConfigSchema = exports.marginsSchema = exports.appSettingSchema = exports.createProjectVersionSchema = exports.createColorPaletteSchema = exports.createTemplateSchema = exports.createAssetSchema = exports.updatePageSchema = exports.createPageSchema = exports.updateProjectSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
// Project validation schemas
exports.createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Project name is required').max(255, 'Project name too long'),
    description: zod_1.z.string().max(1000, 'Description too long').optional(),
    page_format: zod_1.z.enum(['A4', 'A3', 'A5', 'Letter', 'Legal', 'Custom']).default('A4'),
    page_orientation: zod_1.z.enum(['portrait', 'landscape']).default('portrait'),
    margins: zod_1.z.string().default('{"top":20,"bottom":20,"left":20,"right":20}'),
    color_palette_id: zod_1.z.number().int().positive().optional()
});
exports.updateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Project name is required').max(255, 'Project name too long').optional(),
    description: zod_1.z.string().max(1000, 'Description too long').optional(),
    page_format: zod_1.z.enum(['A4', 'A3', 'A5', 'Letter', 'Legal', 'Custom']).optional(),
    page_orientation: zod_1.z.enum(['portrait', 'landscape']).optional(),
    margins: zod_1.z.string().optional(),
    color_palette_id: zod_1.z.number().int().positive().optional(),
    last_export_path: zod_1.z.string().optional()
});
// Page validation schemas
exports.createPageSchema = zod_1.z.object({
    project_id: zod_1.z.number().int().positive('Invalid project ID'),
    page_number: zod_1.z.number().int().positive().optional(),
    name: zod_1.z.string().max(255, 'Page name too long').default('Page'),
    html_content: zod_1.z.string().default(''),
    css_styles: zod_1.z.string().default(''),
    template_id: zod_1.z.number().int().positive().optional(),
    page_config: zod_1.z.string().default('{}')
});
exports.updatePageSchema = zod_1.z.object({
    name: zod_1.z.string().max(255, 'Page name too long').optional(),
    html_content: zod_1.z.string().optional(),
    css_styles: zod_1.z.string().optional(),
    template_id: zod_1.z.number().int().positive().optional(),
    page_config: zod_1.z.string().optional()
});
// Asset validation schemas
exports.createAssetSchema = zod_1.z.object({
    project_id: zod_1.z.number().int().positive('Invalid project ID'),
    filename: zod_1.z.string().min(1, 'Filename is required').max(255, 'Filename too long'),
    original_name: zod_1.z.string().min(1, 'Original name is required').max(255, 'Original name too long'),
    mime_type: zod_1.z.string().min(1, 'MIME type is required'),
    file_size: zod_1.z.number().int().nonnegative('File size must be non-negative'),
    file_data: zod_1.z.instanceof(Buffer, { message: 'File data must be a Buffer' }),
    width: zod_1.z.number().int().positive().optional(),
    height: zod_1.z.number().int().positive().optional(),
    thumbnail: zod_1.z.instanceof(Buffer).optional()
});
// Template validation schemas
exports.createTemplateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Template name is required').max(255, 'Template name too long'),
    category: zod_1.z.string().max(100, 'Category name too long').default('general'),
    html_template: zod_1.z.string().min(1, 'HTML template is required'),
    css_template: zod_1.z.string().min(1, 'CSS template is required'),
    preview_image: zod_1.z.instanceof(Buffer).optional(),
    description: zod_1.z.string().max(1000, 'Description too long').optional()
});
// Color palette validation schemas
exports.createColorPaletteSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Palette name is required').max(255, 'Palette name too long'),
    description: zod_1.z.string().max(1000, 'Description too long').optional(),
    colors: zod_1.z.string().min(1, 'Colors are required'),
    theme_type: zod_1.z.string().max(50, 'Theme type too long').default('custom'),
    is_default: zod_1.z.boolean().default(false)
});
// Project version validation schemas
exports.createProjectVersionSchema = zod_1.z.object({
    project_id: zod_1.z.number().int().positive('Invalid project ID'),
    version_number: zod_1.z.number().int().positive('Version number must be positive'),
    description: zod_1.z.string().max(255, 'Description too long').default('Auto-save'),
    data_snapshot: zod_1.z.string().optional(),
    file_size: zod_1.z.number().int().nonnegative().optional()
});
// Settings validation schema
exports.appSettingSchema = zod_1.z.object({
    key: zod_1.z.string().min(1, 'Setting key is required').max(255, 'Key too long'),
    value: zod_1.z.string().max(2000, 'Value too long').optional()
});
// Utility validation schemas
exports.marginsSchema = zod_1.z.object({
    top: zod_1.z.number().nonnegative('Top margin must be non-negative'),
    bottom: zod_1.z.number().nonnegative('Bottom margin must be non-negative'),
    left: zod_1.z.number().nonnegative('Left margin must be non-negative'),
    right: zod_1.z.number().nonnegative('Right margin must be non-negative')
});
exports.pageConfigSchema = zod_1.z.object({
    background_color: zod_1.z.string().optional(),
    custom_css: zod_1.z.string().optional(),
    print_settings: zod_1.z.any().optional()
});
exports.colorsArraySchema = zod_1.z.array(zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'));
// ID validation
exports.idSchema = zod_1.z.number().int().positive('Invalid ID');
// Pagination validation
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.number().int().positive().optional(),
    limit: zod_1.z.number().int().positive().max(100).optional(),
    orderBy: zod_1.z.string().max(50).optional(),
    direction: zod_1.z.enum(['ASC', 'DESC']).optional()
});
// File validation
exports.fileValidationSchema = zod_1.z.object({
    filename: zod_1.z.string().min(1).max(255),
    size: zod_1.z.number().int().nonnegative().max(50 * 1024 * 1024), // 50MB max
    mimetype: zod_1.z.string().min(1)
});
exports.imageFileSchema = exports.fileValidationSchema.extend({
    mimetype: zod_1.z.string().regex(/^image\/(jpeg|jpg|png|gif|webp|svg\+xml)$/, 'Invalid image type')
});
// Export commonly used schemas
exports.validationSchemas = {
    project: {
        create: exports.createProjectSchema,
        update: exports.updateProjectSchema
    },
    page: {
        create: exports.createPageSchema,
        update: exports.updatePageSchema
    },
    asset: {
        create: exports.createAssetSchema
    },
    template: {
        create: exports.createTemplateSchema
    },
    colorPalette: {
        create: exports.createColorPaletteSchema
    },
    projectVersion: {
        create: exports.createProjectVersionSchema
    },
    appSetting: exports.appSettingSchema,
    id: exports.idSchema,
    pagination: exports.paginationSchema,
    margins: exports.marginsSchema,
    pageConfig: exports.pageConfigSchema,
    colorsArray: exports.colorsArraySchema,
    file: exports.fileValidationSchema,
    imageFile: exports.imageFileSchema
};
//# sourceMappingURL=validation.js.map