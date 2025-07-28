import Database from 'better-sqlite3';
import { BaseService, CrudOperations, PaginatedResult, PaginationOptions } from './base-service';
import { Project, CreateProjectData, UpdateProjectData } from '../../shared/types/database';
import { validationSchemas } from '../../shared/types/validation';

export class ProjectService extends BaseService implements CrudOperations<Project, CreateProjectData, UpdateProjectData> {
  
  constructor(db: Database.Database) {
    super(db);
  }

  /**
   * Create a new project
   */
  async create(data: CreateProjectData): Promise<Project> {
    try {
      const validatedData = this.validate(data, validationSchemas.project.create);
      
      const result = this.executeStatement(`
        INSERT INTO projects (name, description, page_format, page_orientation, margins, color_palette_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        validatedData.name,
        validatedData.description || null,
        validatedData.page_format,
        validatedData.page_orientation,
        validatedData.margins,
        validatedData.color_palette_id || null
      ]);

      const project = await this.getById(result.lastInsertRowid as number);
      if (!project) {
        throw new Error('Failed to create project');
      }

      console.log(`Created project: ${project.name} (ID: ${project.id})`);
      return project;
    } catch (error) {
      this.handleError(error as Error, 'ProjectService.create');
    }
  }

  /**
   * Get project by ID
   */
  async getById(id: number): Promise<Project | null> {
    try {
      this.validate(id, validationSchemas.id);
      
      return this.executeQueryOne<Project>(`
        SELECT * FROM projects WHERE id = ?
      `, [id]);
    } catch (error) {
      this.handleError(error as Error, 'ProjectService.getById');
    }
  }

  /**
   * Get all projects with optional filtering
   */
  async getAll(filters?: Record<string, any>): Promise<Project[]> {
    try {
      let sql = 'SELECT * FROM projects';
      let params: any[] = [];

      if (filters) {
        const { clause, params: filterParams } = this.buildWhereClause(filters);
        sql += ` ${clause}`;
        params = filterParams;
      }

      sql += ' ORDER BY last_accessed DESC';

      return this.executeQuery<Project>(sql, params);
    } catch (error) {
      this.handleError(error as Error, 'ProjectService.getAll');
    }
  }

  /**
   * Get recent projects
   */
  async getRecent(limit: number = 10): Promise<Project[]> {
    try {
      return this.executeQuery<Project>(`
        SELECT * FROM projects 
        ORDER BY last_accessed DESC 
        LIMIT ?
      `, [limit]);
    } catch (error) {
      this.handleError(error as Error, 'ProjectService.getRecent');
    }
  }

  /**
   * Get paginated projects
   */
  async getPaginated(options: PaginationOptions): Promise<PaginatedResult<Project>> {
    try {
      const { page = 1, limit = 20, orderBy = 'last_accessed', direction = 'DESC' } = options;
      
      const offset = (page - 1) * limit;
      
      // Get total count
      const totalResult = this.executeQueryOne<{ count: number }>('SELECT COUNT(*) as count FROM projects');
      const total = totalResult?.count || 0;
      
      // Get data
      const data = this.executeQuery<Project>(`
        SELECT * FROM projects
        ORDER BY ${orderBy} ${direction}
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      this.handleError(error as Error, 'ProjectService.getPaginated');
    }
  }

  /**
   * Update project
   */
  async update(id: number, data: UpdateProjectData): Promise<Project> {
    try {
      this.validate(id, validationSchemas.id);
      const validatedData = this.validate(data, validationSchemas.project.update);

      const setPairs: string[] = [];
      const params: any[] = [];

      for (const [key, value] of Object.entries(validatedData)) {
        if (value !== undefined) {
          setPairs.push(`${key} = ?`);
          params.push(value);
        }
      }

      if (setPairs.length === 0) {
        throw new Error('No valid fields to update');
      }

      setPairs.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      this.executeStatement(`
        UPDATE projects 
        SET ${setPairs.join(', ')}
        WHERE id = ?
      `, params);

      const project = await this.getById(id);
      if (!project) {
        throw new Error('Project not found after update');
      }

      console.log(`Updated project: ${project.name} (ID: ${id})`);
      return project;
    } catch (error) {
      this.handleError(error as Error, 'ProjectService.update');
    }
  }

  /**
   * Delete project and all related data
   */
  async delete(id: number): Promise<void> {
    try {
      this.validate(id, validationSchemas.id);

      const project = await this.getById(id);
      if (!project) {
        throw new Error('Project not found');
      }

      // Create transaction to delete project and all related data
      const transaction = this.createTransaction(() => {
        // Delete in correct order due to foreign key constraints
        this.executeStatement('DELETE FROM project_versions WHERE project_id = ?', [id]);
        this.executeStatement('DELETE FROM assets WHERE project_id = ?', [id]);
        this.executeStatement('DELETE FROM pages WHERE project_id = ?', [id]);
        this.executeStatement('DELETE FROM projects WHERE id = ?', [id]);
      });

      transaction();

      console.log(`Deleted project: ${project.name} (ID: ${id})`);
    } catch (error) {
      this.handleError(error as Error, 'ProjectService.delete');
    }
  }

  /**
   * Update last accessed timestamp
   */
  async updateLastAccessed(id: number): Promise<void> {
    try {
      this.validate(id, validationSchemas.id);

      this.executeStatement(`
        UPDATE projects 
        SET last_accessed = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [id]);
    } catch (error) {
      this.handleError(error as Error, 'ProjectService.updateLastAccessed');
    }
  }

  /**
   * Update page count for a project
   */
  async updatePageCount(projectId: number): Promise<void> {
    try {
      this.validate(projectId, validationSchemas.id);

      const countResult = this.executeQueryOne<{ count: number }>(`
        SELECT COUNT(*) as count FROM pages WHERE project_id = ?
      `, [projectId]);

      const pageCount = countResult?.count || 0;

      this.executeStatement(`
        UPDATE projects 
        SET page_count = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [pageCount, projectId]);
    } catch (error) {
      this.handleError(error as Error, 'ProjectService.updatePageCount');
    }
  }

  /**
   * Update word count for a project
   */
  async updateWordCount(projectId: number): Promise<void> {
    try {
      this.validate(projectId, validationSchemas.id);

      // Get all pages for the project and count words
      const pages = this.executeQuery<{ html_content: string }>(`
        SELECT html_content FROM pages WHERE project_id = ?
      `, [projectId]);

      let totalWords = 0;
      for (const page of pages) {
        // Simple word count - remove HTML tags and count words
        const textContent = page.html_content.replace(/<[^>]*>/g, ' ');
        const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
        totalWords += words.length;
      }

      this.executeStatement(`
        UPDATE projects 
        SET word_count = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [totalWords, projectId]);
    } catch (error) {
      this.handleError(error as Error, 'ProjectService.updateWordCount');
    }
  }

  /**
   * Search projects by name or description
   */
  async search(query: string, limit: number = 20): Promise<Project[]> {
    try {
      const searchPattern = `%${query}%`;
      
      return this.executeQuery<Project>(`
        SELECT * FROM projects 
        WHERE name LIKE ? OR description LIKE ?
        ORDER BY 
          CASE 
            WHEN name LIKE ? THEN 1
            WHEN description LIKE ? THEN 2
            ELSE 3
          END,
          last_accessed DESC
        LIMIT ?
      `, [searchPattern, searchPattern, searchPattern, searchPattern, limit]);
    } catch (error) {
      this.handleError(error as Error, 'ProjectService.search');
    }
  }

  /**
   * Get project statistics
   */
  async getProjectStats(id: number): Promise<{
    pageCount: number;
    wordCount: number;
    assetCount: number;
    versionCount: number;
    lastModified: string;
  }> {
    try {
      this.validate(id, validationSchemas.id);

      const stats = this.executeQueryOne<any>(`
        SELECT 
          p.page_count,
          p.word_count,
          p.updated_at as last_modified,
          (SELECT COUNT(*) FROM assets WHERE project_id = ?) as asset_count,
          (SELECT COUNT(*) FROM project_versions WHERE project_id = ?) as version_count
        FROM projects p
        WHERE p.id = ?
      `, [id, id, id]);

      if (!stats) {
        throw new Error('Project not found');
      }

      return {
        pageCount: stats.page_count || 0,
        wordCount: stats.word_count || 0,
        assetCount: stats.asset_count || 0,
        versionCount: stats.version_count || 0,
        lastModified: stats.last_modified
      };
    } catch (error) {
      this.handleError(error as Error, 'ProjectService.getProjectStats');
    }
  }

  /**
   * Count projects with optional filters
   */
  async count(filters?: Record<string, any>): Promise<number> {
    try {
      let sql = 'SELECT COUNT(*) as count FROM projects';
      let params: any[] = [];

      if (filters) {
        const { clause, params: filterParams } = this.buildWhereClause(filters);
        sql += ` ${clause}`;
        params = filterParams;
      }

      const result = this.executeQueryOne<{ count: number }>(sql, params);
      return result?.count || 0;
    } catch (error) {
      this.handleError(error as Error, 'ProjectService.count');
    }
  }
}