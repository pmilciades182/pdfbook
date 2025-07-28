// Shared type definitions for database entities

export interface Project {
  id: number;
  name: string;
  description?: string;
  file_path?: string;
  page_format: string;
  page_orientation: string;
  margins: string; // JSON string
  color_palette_id?: number;
  word_count: number;
  page_count: number;
  last_export_path?: string;
  created_at: string;
  updated_at: string;
  last_accessed: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  page_format?: string;
  page_orientation?: string;
  margins?: string;
  color_palette_id?: number;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  page_format?: string;
  page_orientation?: string;
  margins?: string;
  color_palette_id?: number;
  last_export_path?: string;
}

export interface Page {
  id: number;
  project_id: number;
  page_number: number;
  name: string;
  html_content: string;
  css_styles: string;
  template_id?: number;
  page_config: string; // JSON string
  created_at: string;
  updated_at: string;
}

export interface CreatePageData {
  project_id: number;
  page_number?: number;
  name?: string;
  html_content?: string;
  css_styles?: string;
  template_id?: number;
  page_config?: string;
}

export interface UpdatePageData {
  name?: string;
  html_content?: string;
  css_styles?: string;
  template_id?: number;
  page_config?: string;
}

export interface Asset {
  id: number;
  project_id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  file_data: Buffer;
  width?: number;
  height?: number;
  thumbnail?: Buffer;
  created_at: string;
}

export interface CreateAssetData {
  project_id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  file_data: Buffer;
  width?: number;
  height?: number;
  thumbnail?: Buffer;
}

export interface Template {
  id: number;
  name: string;
  category: string;
  html_template: string;
  css_template: string;
  preview_image?: Buffer;
  is_builtin: boolean;
  description?: string;
  created_at: string;
}

export interface CreateTemplateData {
  name: string;
  category?: string;
  html_template: string;
  css_template: string;
  preview_image?: Buffer;
  description?: string;
}

export interface ColorPalette {
  id: number;
  name: string;
  description?: string;
  colors: string; // JSON array of colors
  theme_type: string;
  is_default: boolean;
  created_at: string;
}

export interface CreateColorPaletteData {
  name: string;
  description?: string;
  colors: string;
  theme_type?: string;
  is_default?: boolean;
}

export interface ProjectVersion {
  id: number;
  project_id: number;
  version_number: number;
  description: string;
  data_snapshot?: string; // JSON string
  file_size?: number;
  created_at: string;
}

export interface CreateProjectVersionData {
  project_id: number;
  version_number: number;
  description?: string;
  data_snapshot?: string;
  file_size?: number;
}

export interface AppSetting {
  id: number;
  key: string;
  value?: string;
  created_at: string;
  updated_at: string;
}

// Utility types
export interface Margins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface PageConfig {
  background_color?: string;
  custom_css?: string;
  print_settings?: any;
}

export interface DatabaseStats {
  project_count: number;
  page_count: number;
  asset_count: number;
  template_count: number;
  palette_count: number;
  version_count: number;
}

export type PageFormat = 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal' | 'Custom';
export type PageOrientation = 'portrait' | 'landscape';
export type ThemeType = 'classic' | 'modern' | 'vintage' | 'nature' | 'custom';