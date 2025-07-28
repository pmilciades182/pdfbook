import Database from 'better-sqlite3';
import { BaseService, CrudOperations } from './base-service';
import { Page, CreatePageData, UpdatePageData } from '../../shared/types/database';
import { validationSchemas } from '../../shared/types/validation';

export class PageService extends BaseService implements CrudOperations<Page, CreatePageData, UpdatePageData> {
  
  constructor(db: Database.Database) {
    super(db);
  }

  /**
   * Create a new page
   */
  async create(data: CreatePageData): Promise<Page> {
    try {
      const validatedData = this.validate(data, validationSchemas.page.create);
      
      // Get the next page number if not provided
      const pageNumber = validatedData.page_number || await this.getNextPageNumber(validatedData.project_id);
      
      const result = this.executeStatement(`
        INSERT INTO pages (project_id, page_number, name, html_content, css_styles, template_id, page_config)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        validatedData.project_id,
        pageNumber,
        validatedData.name,
        validatedData.html_content,
        validatedData.css_styles,
        validatedData.template_id || null,
        validatedData.page_config
      ]);

      const page = await this.getById(result.lastInsertRowid as number);
      if (!page) {
        throw new Error('Failed to create page');
      }

      // Update project page count and word count
      await this.updateProjectStats(validatedData.project_id);

      console.log(`Created page: ${page.name} for project ${validatedData.project_id}`);
      return page;
    } catch (error) {
      this.handleError(error as Error, 'PageService.create');
    }
  }

  /**
   * Get page by ID
   */
  async getById(id: number): Promise<Page | null> {
    try {
      this.validate(id, validationSchemas.id);
      
      return this.executeQueryOne<Page>(`
        SELECT * FROM pages WHERE id = ?
      `, [id]);
    } catch (error) {
      this.handleError(error as Error, 'PageService.getById');
    }
  }

  /**
   * Get all pages with optional filtering
   */
  async getAll(filters?: Record<string, any>): Promise<Page[]> {
    try {
      let sql = 'SELECT * FROM pages';
      let params: any[] = [];

      if (filters) {
        const { clause, params: filterParams } = this.buildWhereClause(filters);
        sql += ` ${clause}`;
        params = filterParams;
      }

      sql += ' ORDER BY project_id, page_number';

      return this.executeQuery<Page>(sql, params);
    } catch (error) {
      this.handleError(error as Error, 'PageService.getAll');
    }
  }

  /**
   * Get pages by project ID
   */
  async getByProjectId(projectId: number): Promise<Page[]> {
    try {
      this.validate(projectId, validationSchemas.id);
      
      return this.executeQuery<Page>(`
        SELECT * FROM pages 
        WHERE project_id = ? 
        ORDER BY page_number
      `, [projectId]);
    } catch (error) {
      this.handleError(error as Error, 'PageService.getByProjectId');
    }
  }

  /**
   * Update page
   */
  async update(id: number, data: UpdatePageData): Promise<Page> {
    try {
      this.validate(id, validationSchemas.id);
      const validatedData = this.validate(data, validationSchemas.page.update);

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
        UPDATE pages 
        SET ${setPairs.join(', ')}
        WHERE id = ?
      `, params);

      const page = await this.getById(id);
      if (!page) {
        throw new Error('Page not found after update');
      }

      // Update project word count if content changed
      if (validatedData.html_content !== undefined) {
        await this.updateProjectStats(page.project_id);
      }

      console.log(`Updated page: ${page.name} (ID: ${id})`);
      return page;
    } catch (error) {
      this.handleError(error as Error, 'PageService.update');
    }
  }

  /**
   * Delete page
   */
  async delete(id: number): Promise<void> {
    try {
      this.validate(id, validationSchemas.id);

      const page = await this.getById(id);
      if (!page) {
        throw new Error('Page not found');
      }

      const projectId = page.project_id;

      this.executeStatement('DELETE FROM pages WHERE id = ?', [id]);

      // Reorder remaining pages to close gaps
      await this.reorderPagesAfterDeletion(projectId, page.page_number);

      // Update project stats
      await this.updateProjectStats(projectId);

      console.log(`Deleted page: ${page.name} (ID: ${id})`);
    } catch (error) {
      this.handleError(error as Error, 'PageService.delete');
    }
  }

  /**
   * Reorder pages in a project
   */
  async reorderPages(projectId: number, pageOrder: number[]): Promise<void> {
    try {
      this.validate(projectId, validationSchemas.id);

      const transaction = this.createTransaction(() => {
        pageOrder.forEach((pageId, index) => {
          this.executeStatement(`
            UPDATE pages 
            SET page_number = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND project_id = ?
          `, [index + 1, pageId, projectId]);
        });
      });

      transaction();

      console.log(`Reordered pages for project ${projectId}`);
    } catch (error) {
      this.handleError(error as Error, 'PageService.reorderPages');
    }
  }

  /**
   * Duplicate a page
   */
  async duplicate(id: number, insertAfter: boolean = true): Promise<Page> {
    try {
      this.validate(id, validationSchemas.id);

      const originalPage = await this.getById(id);
      if (!originalPage) {
        throw new Error('Page not found');
      }

      // Calculate new page number
      const newPageNumber = insertAfter 
        ? originalPage.page_number + 1 
        : originalPage.page_number;

      // Shift existing pages if necessary
      if (insertAfter) {
        this.executeStatement(`
          UPDATE pages 
          SET page_number = page_number + 1, updated_at = CURRENT_TIMESTAMP
          WHERE project_id = ? AND page_number > ?
        `, [originalPage.project_id, originalPage.page_number]);
      } else {
        this.executeStatement(`
          UPDATE pages 
          SET page_number = page_number + 1, updated_at = CURRENT_TIMESTAMP
          WHERE project_id = ? AND page_number >= ?
        `, [originalPage.project_id, originalPage.page_number]);
      }

      // Create the duplicate
      const duplicateData: CreatePageData = {
        project_id: originalPage.project_id,
        page_number: newPageNumber,
        name: `${originalPage.name} (Copy)`,
        html_content: originalPage.html_content,
        css_styles: originalPage.css_styles,
        template_id: originalPage.template_id || undefined,
        page_config: originalPage.page_config
      };

      const duplicatedPage = await this.create(duplicateData);
      console.log(`Duplicated page: ${originalPage.name} -> ${duplicatedPage.name}`);
      
      return duplicatedPage;
    } catch (error) {
      this.handleError(error as Error, 'PageService.duplicate');
    }
  }

  /**
   * Move page to different position
   */
  async movePage(id: number, newPageNumber: number): Promise<Page> {
    try {
      this.validate(id, validationSchemas.id);

      const page = await this.getById(id);
      if (!page) {
        throw new Error('Page not found');
      }

      const currentPageNumber = page.page_number;
      const projectId = page.project_id;

      if (currentPageNumber === newPageNumber) {
        return page; // No change needed
      }

      const transaction = this.createTransaction(() => {
        if (newPageNumber > currentPageNumber) {
          // Moving down - shift pages up
          this.executeStatement(`
            UPDATE pages 
            SET page_number = page_number - 1, updated_at = CURRENT_TIMESTAMP
            WHERE project_id = ? AND page_number > ? AND page_number <= ?
          `, [projectId, currentPageNumber, newPageNumber]);
        } else {
          // Moving up - shift pages down
          this.executeStatement(`
            UPDATE pages 
            SET page_number = page_number + 1, updated_at = CURRENT_TIMESTAMP
            WHERE project_id = ? AND page_number >= ? AND page_number < ?
          `, [projectId, newPageNumber, currentPageNumber]);
        }

        // Update the target page
        this.executeStatement(`
          UPDATE pages 
          SET page_number = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [newPageNumber, id]);
      });

      transaction();

      const updatedPage = await this.getById(id);
      if (!updatedPage) {
        throw new Error('Page not found after move');
      }

      console.log(`Moved page ${page.name} from position ${currentPageNumber} to ${newPageNumber}`);
      return updatedPage;
    } catch (error) {
      this.handleError(error as Error, 'PageService.movePage');
    }
  }

  /**
   * Get page content for export
   */
  async getPageContent(id: number): Promise<{ html: string; css: string }> {
    try {
      this.validate(id, validationSchemas.id);

      const page = await this.getById(id);
      if (!page) {
        throw new Error('Page not found');
      }

      return {
        html: page.html_content,
        css: page.css_styles
      };
    } catch (error) {
      this.handleError(error as Error, 'PageService.getPageContent');
    }
  }

  /**
   * Count pages with optional filters
   */
  async count(filters?: Record<string, any>): Promise<number> {
    try {
      let sql = 'SELECT COUNT(*) as count FROM pages';
      let params: any[] = [];

      if (filters) {
        const { clause, params: filterParams } = this.buildWhereClause(filters);
        sql += ` ${clause}`;
        params = filterParams;
      }

      const result = this.executeQueryOne<{ count: number }>(sql, params);
      return result?.count || 0;
    } catch (error) {
      this.handleError(error as Error, 'PageService.count');
    }
  }

  /**
   * Get the next page number for a project
   */
  private async getNextPageNumber(projectId: number): Promise<number> {
    const result = this.executeQueryOne<{ max_page: number }>(`
      SELECT COALESCE(MAX(page_number), 0) as max_page 
      FROM pages 
      WHERE project_id = ?
    `, [projectId]);

    return (result?.max_page || 0) + 1;
  }

  /**
   * Reorder pages after deletion to close gaps
   */
  private async reorderPagesAfterDeletion(projectId: number, deletedPageNumber: number): Promise<void> {
    this.executeStatement(`
      UPDATE pages 
      SET page_number = page_number - 1, updated_at = CURRENT_TIMESTAMP
      WHERE project_id = ? AND page_number > ?
    `, [projectId, deletedPageNumber]);
  }

  /**
   * Update project statistics after page changes
   */
  private async updateProjectStats(projectId: number): Promise<void> {
    // Update page count
    const pageCountResult = this.executeQueryOne<{ count: number }>(`
      SELECT COUNT(*) as count FROM pages WHERE project_id = ?
    `, [projectId]);

    const pageCount = pageCountResult?.count || 0;

    // Calculate word count
    const pages = this.executeQuery<{ html_content: string }>(`
      SELECT html_content FROM pages WHERE project_id = ?
    `, [projectId]);

    let totalWords = 0;
    for (const page of pages) {
      const textContent = page.html_content.replace(/<[^>]*>/g, ' ');
      const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
      totalWords += words.length;
    }

    // Update project
    this.executeStatement(`
      UPDATE projects 
      SET page_count = ?, word_count = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [pageCount, totalWords, projectId]);
  }
}