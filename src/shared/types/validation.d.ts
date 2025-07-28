import { z } from 'zod';
export declare const createProjectSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    page_format: z.ZodDefault<z.ZodEnum<["A4", "A3", "A5", "Letter", "Legal", "Custom"]>>;
    page_orientation: z.ZodDefault<z.ZodEnum<["portrait", "landscape"]>>;
    margins: z.ZodDefault<z.ZodString>;
    color_palette_id: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    page_format: "A4" | "A3" | "A5" | "Letter" | "Legal" | "Custom";
    page_orientation: "portrait" | "landscape";
    margins: string;
    description?: string | undefined;
    color_palette_id?: number | undefined;
}, {
    name: string;
    description?: string | undefined;
    page_format?: "A4" | "A3" | "A5" | "Letter" | "Legal" | "Custom" | undefined;
    page_orientation?: "portrait" | "landscape" | undefined;
    margins?: string | undefined;
    color_palette_id?: number | undefined;
}>;
export declare const updateProjectSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    page_format: z.ZodOptional<z.ZodEnum<["A4", "A3", "A5", "Letter", "Legal", "Custom"]>>;
    page_orientation: z.ZodOptional<z.ZodEnum<["portrait", "landscape"]>>;
    margins: z.ZodOptional<z.ZodString>;
    color_palette_id: z.ZodOptional<z.ZodNumber>;
    last_export_path: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    page_format?: "A4" | "A3" | "A5" | "Letter" | "Legal" | "Custom" | undefined;
    page_orientation?: "portrait" | "landscape" | undefined;
    margins?: string | undefined;
    color_palette_id?: number | undefined;
    last_export_path?: string | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    page_format?: "A4" | "A3" | "A5" | "Letter" | "Legal" | "Custom" | undefined;
    page_orientation?: "portrait" | "landscape" | undefined;
    margins?: string | undefined;
    color_palette_id?: number | undefined;
    last_export_path?: string | undefined;
}>;
export declare const createPageSchema: z.ZodObject<{
    project_id: z.ZodNumber;
    page_number: z.ZodOptional<z.ZodNumber>;
    name: z.ZodDefault<z.ZodString>;
    html_content: z.ZodDefault<z.ZodString>;
    css_styles: z.ZodDefault<z.ZodString>;
    template_id: z.ZodOptional<z.ZodNumber>;
    page_config: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    project_id: number;
    html_content: string;
    css_styles: string;
    page_config: string;
    page_number?: number | undefined;
    template_id?: number | undefined;
}, {
    project_id: number;
    name?: string | undefined;
    page_number?: number | undefined;
    html_content?: string | undefined;
    css_styles?: string | undefined;
    template_id?: number | undefined;
    page_config?: string | undefined;
}>;
export declare const updatePageSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    html_content: z.ZodOptional<z.ZodString>;
    css_styles: z.ZodOptional<z.ZodString>;
    template_id: z.ZodOptional<z.ZodNumber>;
    page_config: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    html_content?: string | undefined;
    css_styles?: string | undefined;
    template_id?: number | undefined;
    page_config?: string | undefined;
}, {
    name?: string | undefined;
    html_content?: string | undefined;
    css_styles?: string | undefined;
    template_id?: number | undefined;
    page_config?: string | undefined;
}>;
export declare const createAssetSchema: z.ZodObject<{
    project_id: z.ZodNumber;
    filename: z.ZodString;
    original_name: z.ZodString;
    mime_type: z.ZodString;
    file_size: z.ZodNumber;
    file_data: z.ZodType<Buffer<ArrayBufferLike>, z.ZodTypeDef, Buffer<ArrayBufferLike>>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    thumbnail: z.ZodOptional<z.ZodType<Buffer<ArrayBufferLike>, z.ZodTypeDef, Buffer<ArrayBufferLike>>>;
}, "strip", z.ZodTypeAny, {
    project_id: number;
    filename: string;
    original_name: string;
    mime_type: string;
    file_size: number;
    file_data: Buffer<ArrayBufferLike>;
    width?: number | undefined;
    height?: number | undefined;
    thumbnail?: Buffer<ArrayBufferLike> | undefined;
}, {
    project_id: number;
    filename: string;
    original_name: string;
    mime_type: string;
    file_size: number;
    file_data: Buffer<ArrayBufferLike>;
    width?: number | undefined;
    height?: number | undefined;
    thumbnail?: Buffer<ArrayBufferLike> | undefined;
}>;
export declare const createTemplateSchema: z.ZodObject<{
    name: z.ZodString;
    category: z.ZodDefault<z.ZodString>;
    html_template: z.ZodString;
    css_template: z.ZodString;
    preview_image: z.ZodOptional<z.ZodType<Buffer<ArrayBufferLike>, z.ZodTypeDef, Buffer<ArrayBufferLike>>>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    category: string;
    html_template: string;
    css_template: string;
    description?: string | undefined;
    preview_image?: Buffer<ArrayBufferLike> | undefined;
}, {
    name: string;
    html_template: string;
    css_template: string;
    description?: string | undefined;
    category?: string | undefined;
    preview_image?: Buffer<ArrayBufferLike> | undefined;
}>;
export declare const createColorPaletteSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    colors: z.ZodString;
    theme_type: z.ZodDefault<z.ZodString>;
    is_default: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    colors: string;
    theme_type: string;
    is_default: boolean;
    description?: string | undefined;
}, {
    name: string;
    colors: string;
    description?: string | undefined;
    theme_type?: string | undefined;
    is_default?: boolean | undefined;
}>;
export declare const createProjectVersionSchema: z.ZodObject<{
    project_id: z.ZodNumber;
    version_number: z.ZodNumber;
    description: z.ZodDefault<z.ZodString>;
    data_snapshot: z.ZodOptional<z.ZodString>;
    file_size: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    description: string;
    project_id: number;
    version_number: number;
    file_size?: number | undefined;
    data_snapshot?: string | undefined;
}, {
    project_id: number;
    version_number: number;
    description?: string | undefined;
    file_size?: number | undefined;
    data_snapshot?: string | undefined;
}>;
export declare const appSettingSchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    key: string;
    value?: string | undefined;
}, {
    key: string;
    value?: string | undefined;
}>;
export declare const marginsSchema: z.ZodObject<{
    top: z.ZodNumber;
    bottom: z.ZodNumber;
    left: z.ZodNumber;
    right: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    top: number;
    bottom: number;
    left: number;
    right: number;
}, {
    top: number;
    bottom: number;
    left: number;
    right: number;
}>;
export declare const pageConfigSchema: z.ZodObject<{
    background_color: z.ZodOptional<z.ZodString>;
    custom_css: z.ZodOptional<z.ZodString>;
    print_settings: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    background_color?: string | undefined;
    custom_css?: string | undefined;
    print_settings?: any;
}, {
    background_color?: string | undefined;
    custom_css?: string | undefined;
    print_settings?: any;
}>;
export declare const colorsArraySchema: z.ZodArray<z.ZodString, "many">;
export declare const idSchema: z.ZodNumber;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    orderBy: z.ZodOptional<z.ZodString>;
    direction: z.ZodOptional<z.ZodEnum<["ASC", "DESC"]>>;
}, "strip", z.ZodTypeAny, {
    page?: number | undefined;
    limit?: number | undefined;
    orderBy?: string | undefined;
    direction?: "ASC" | "DESC" | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    orderBy?: string | undefined;
    direction?: "ASC" | "DESC" | undefined;
}>;
export declare const fileValidationSchema: z.ZodObject<{
    filename: z.ZodString;
    size: z.ZodNumber;
    mimetype: z.ZodString;
}, "strip", z.ZodTypeAny, {
    filename: string;
    size: number;
    mimetype: string;
}, {
    filename: string;
    size: number;
    mimetype: string;
}>;
export declare const imageFileSchema: z.ZodObject<{
    filename: z.ZodString;
    size: z.ZodNumber;
} & {
    mimetype: z.ZodString;
}, "strip", z.ZodTypeAny, {
    filename: string;
    size: number;
    mimetype: string;
}, {
    filename: string;
    size: number;
    mimetype: string;
}>;
export declare const validationSchemas: {
    project: {
        create: z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            page_format: z.ZodDefault<z.ZodEnum<["A4", "A3", "A5", "Letter", "Legal", "Custom"]>>;
            page_orientation: z.ZodDefault<z.ZodEnum<["portrait", "landscape"]>>;
            margins: z.ZodDefault<z.ZodString>;
            color_palette_id: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            page_format: "A4" | "A3" | "A5" | "Letter" | "Legal" | "Custom";
            page_orientation: "portrait" | "landscape";
            margins: string;
            description?: string | undefined;
            color_palette_id?: number | undefined;
        }, {
            name: string;
            description?: string | undefined;
            page_format?: "A4" | "A3" | "A5" | "Letter" | "Legal" | "Custom" | undefined;
            page_orientation?: "portrait" | "landscape" | undefined;
            margins?: string | undefined;
            color_palette_id?: number | undefined;
        }>;
        update: z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            page_format: z.ZodOptional<z.ZodEnum<["A4", "A3", "A5", "Letter", "Legal", "Custom"]>>;
            page_orientation: z.ZodOptional<z.ZodEnum<["portrait", "landscape"]>>;
            margins: z.ZodOptional<z.ZodString>;
            color_palette_id: z.ZodOptional<z.ZodNumber>;
            last_export_path: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name?: string | undefined;
            description?: string | undefined;
            page_format?: "A4" | "A3" | "A5" | "Letter" | "Legal" | "Custom" | undefined;
            page_orientation?: "portrait" | "landscape" | undefined;
            margins?: string | undefined;
            color_palette_id?: number | undefined;
            last_export_path?: string | undefined;
        }, {
            name?: string | undefined;
            description?: string | undefined;
            page_format?: "A4" | "A3" | "A5" | "Letter" | "Legal" | "Custom" | undefined;
            page_orientation?: "portrait" | "landscape" | undefined;
            margins?: string | undefined;
            color_palette_id?: number | undefined;
            last_export_path?: string | undefined;
        }>;
    };
    page: {
        create: z.ZodObject<{
            project_id: z.ZodNumber;
            page_number: z.ZodOptional<z.ZodNumber>;
            name: z.ZodDefault<z.ZodString>;
            html_content: z.ZodDefault<z.ZodString>;
            css_styles: z.ZodDefault<z.ZodString>;
            template_id: z.ZodOptional<z.ZodNumber>;
            page_config: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            project_id: number;
            html_content: string;
            css_styles: string;
            page_config: string;
            page_number?: number | undefined;
            template_id?: number | undefined;
        }, {
            project_id: number;
            name?: string | undefined;
            page_number?: number | undefined;
            html_content?: string | undefined;
            css_styles?: string | undefined;
            template_id?: number | undefined;
            page_config?: string | undefined;
        }>;
        update: z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            html_content: z.ZodOptional<z.ZodString>;
            css_styles: z.ZodOptional<z.ZodString>;
            template_id: z.ZodOptional<z.ZodNumber>;
            page_config: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name?: string | undefined;
            html_content?: string | undefined;
            css_styles?: string | undefined;
            template_id?: number | undefined;
            page_config?: string | undefined;
        }, {
            name?: string | undefined;
            html_content?: string | undefined;
            css_styles?: string | undefined;
            template_id?: number | undefined;
            page_config?: string | undefined;
        }>;
    };
    asset: {
        create: z.ZodObject<{
            project_id: z.ZodNumber;
            filename: z.ZodString;
            original_name: z.ZodString;
            mime_type: z.ZodString;
            file_size: z.ZodNumber;
            file_data: z.ZodType<Buffer<ArrayBufferLike>, z.ZodTypeDef, Buffer<ArrayBufferLike>>;
            width: z.ZodOptional<z.ZodNumber>;
            height: z.ZodOptional<z.ZodNumber>;
            thumbnail: z.ZodOptional<z.ZodType<Buffer<ArrayBufferLike>, z.ZodTypeDef, Buffer<ArrayBufferLike>>>;
        }, "strip", z.ZodTypeAny, {
            project_id: number;
            filename: string;
            original_name: string;
            mime_type: string;
            file_size: number;
            file_data: Buffer<ArrayBufferLike>;
            width?: number | undefined;
            height?: number | undefined;
            thumbnail?: Buffer<ArrayBufferLike> | undefined;
        }, {
            project_id: number;
            filename: string;
            original_name: string;
            mime_type: string;
            file_size: number;
            file_data: Buffer<ArrayBufferLike>;
            width?: number | undefined;
            height?: number | undefined;
            thumbnail?: Buffer<ArrayBufferLike> | undefined;
        }>;
    };
    template: {
        create: z.ZodObject<{
            name: z.ZodString;
            category: z.ZodDefault<z.ZodString>;
            html_template: z.ZodString;
            css_template: z.ZodString;
            preview_image: z.ZodOptional<z.ZodType<Buffer<ArrayBufferLike>, z.ZodTypeDef, Buffer<ArrayBufferLike>>>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            category: string;
            html_template: string;
            css_template: string;
            description?: string | undefined;
            preview_image?: Buffer<ArrayBufferLike> | undefined;
        }, {
            name: string;
            html_template: string;
            css_template: string;
            description?: string | undefined;
            category?: string | undefined;
            preview_image?: Buffer<ArrayBufferLike> | undefined;
        }>;
    };
    colorPalette: {
        create: z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            colors: z.ZodString;
            theme_type: z.ZodDefault<z.ZodString>;
            is_default: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            colors: string;
            theme_type: string;
            is_default: boolean;
            description?: string | undefined;
        }, {
            name: string;
            colors: string;
            description?: string | undefined;
            theme_type?: string | undefined;
            is_default?: boolean | undefined;
        }>;
    };
    projectVersion: {
        create: z.ZodObject<{
            project_id: z.ZodNumber;
            version_number: z.ZodNumber;
            description: z.ZodDefault<z.ZodString>;
            data_snapshot: z.ZodOptional<z.ZodString>;
            file_size: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            project_id: number;
            version_number: number;
            file_size?: number | undefined;
            data_snapshot?: string | undefined;
        }, {
            project_id: number;
            version_number: number;
            description?: string | undefined;
            file_size?: number | undefined;
            data_snapshot?: string | undefined;
        }>;
    };
    appSetting: z.ZodObject<{
        key: z.ZodString;
        value: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        key: string;
        value?: string | undefined;
    }, {
        key: string;
        value?: string | undefined;
    }>;
    id: z.ZodNumber;
    pagination: z.ZodObject<{
        page: z.ZodOptional<z.ZodNumber>;
        limit: z.ZodOptional<z.ZodNumber>;
        orderBy: z.ZodOptional<z.ZodString>;
        direction: z.ZodOptional<z.ZodEnum<["ASC", "DESC"]>>;
    }, "strip", z.ZodTypeAny, {
        page?: number | undefined;
        limit?: number | undefined;
        orderBy?: string | undefined;
        direction?: "ASC" | "DESC" | undefined;
    }, {
        page?: number | undefined;
        limit?: number | undefined;
        orderBy?: string | undefined;
        direction?: "ASC" | "DESC" | undefined;
    }>;
    margins: z.ZodObject<{
        top: z.ZodNumber;
        bottom: z.ZodNumber;
        left: z.ZodNumber;
        right: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        top: number;
        bottom: number;
        left: number;
        right: number;
    }, {
        top: number;
        bottom: number;
        left: number;
        right: number;
    }>;
    pageConfig: z.ZodObject<{
        background_color: z.ZodOptional<z.ZodString>;
        custom_css: z.ZodOptional<z.ZodString>;
        print_settings: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        background_color?: string | undefined;
        custom_css?: string | undefined;
        print_settings?: any;
    }, {
        background_color?: string | undefined;
        custom_css?: string | undefined;
        print_settings?: any;
    }>;
    colorsArray: z.ZodArray<z.ZodString, "many">;
    file: z.ZodObject<{
        filename: z.ZodString;
        size: z.ZodNumber;
        mimetype: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        filename: string;
        size: number;
        mimetype: string;
    }, {
        filename: string;
        size: number;
        mimetype: string;
    }>;
    imageFile: z.ZodObject<{
        filename: z.ZodString;
        size: z.ZodNumber;
    } & {
        mimetype: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        filename: string;
        size: number;
        mimetype: string;
    }, {
        filename: string;
        size: number;
        mimetype: string;
    }>;
};
//# sourceMappingURL=validation.d.ts.map