import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { ProjectService } from '../../../src/main/services/project-service';
import { CreateProjectData, UpdateProjectData } from '../../../src/shared/types/database';
import { TestDatabaseManager } from '../../../src/main/database/test-database-manager';

describe('ProjectService', () => {
  let projectService: ProjectService;
  let dbManager: TestDatabaseManager;

  beforeEach(async () => {
    dbManager = new TestDatabaseManager();
    await dbManager.initialize();
    projectService = new ProjectService(dbManager.getDatabase());
  });

  afterEach(async () => {
    await dbManager.cleanup();
  });

  describe('create', () => {
    test('should create project with valid data', async () => {
      const projectData: CreateProjectData = {
        name: 'Test Project',
        description: 'A test project',
        page_format: 'A4',
        page_orientation: 'portrait'
      };

      const project = await projectService.create(projectData);

      expect(project).toBeDefined();
      expect(project.id).toBeDefined();
      expect(project.name).toBe(projectData.name);
      expect(project.description).toBe(projectData.description);
      expect(project.page_format).toBe(projectData.page_format);
      expect(project.page_orientation).toBe(projectData.page_orientation);
      expect(project.word_count).toBe(0);
      expect(project.page_count).toBe(0);
    });

    test('should create project with minimal data', async () => {
      const projectData: CreateProjectData = {
        name: 'Minimal Project'
      };

      const project = await projectService.create(projectData);

      expect(project).toBeDefined();
      expect(project.name).toBe(projectData.name);
      expect(project.page_format).toBe('A4'); // default
      expect(project.page_orientation).toBe('portrait'); // default
    });

    test('should reject invalid project data', async () => {
      const invalidData = {
        name: '', // Empty name should fail
        description: 'Test'
      } as CreateProjectData;

      await expect(projectService.create(invalidData)).rejects.toThrow();
    });
  });

  describe('getById', () => {
    test('should retrieve existing project', async () => {
      const projectId = await global.testUtils.createTestProject('Test Project');
      
      const project = await projectService.getById(projectId);

      expect(project).toBeDefined();
      expect(project!.id).toBe(projectId);
      expect(project!.name).toBe('Test Project');
    });

    test('should return null for non-existent project', async () => {
      const project = await projectService.getById(99999);
      expect(project).toBeNull();
    });

    test('should reject invalid ID', async () => {
      await expect(projectService.getById(-1)).rejects.toThrow();
    });
  });

  describe('getAll', () => {
    test('should return all projects', async () => {
      await global.testUtils.createTestProject('Project 1');
      await global.testUtils.createTestProject('Project 2');

      const projects = await projectService.getAll();

      expect(projects).toBeDefined();
      expect(projects.length).toBe(2);
    });

    test('should filter projects correctly', async () => {
      const projectId = await global.testUtils.createTestProject('Filtered Project');
      await global.testUtils.createTestProject('Other Project');

      const projects = await projectService.getAll({ name: 'Filtered Project' });

      expect(projects.length).toBe(1);
      expect(projects[0].id).toBe(projectId);
    });
  });

  describe('update', () => {
    test('should update project with valid data', async () => {
      const projectId = await global.testUtils.createTestProject('Original Name');

      const updateData: UpdateProjectData = {
        name: 'Updated Name',
        description: 'Updated description'
      };

      const updatedProject = await projectService.update(projectId, updateData);

      expect(updatedProject.name).toBe(updateData.name);
      expect(updatedProject.description).toBe(updateData.description);
    });

    test('should reject update with invalid data', async () => {
      const projectId = await global.testUtils.createTestProject('Test Project');

      const invalidData = {
        name: '' // Empty name should fail
      } as UpdateProjectData;

      await expect(projectService.update(projectId, invalidData)).rejects.toThrow();
    });

    test('should reject update for non-existent project', async () => {
      const updateData: UpdateProjectData = {
        name: 'Updated Name'
      };

      await expect(projectService.update(99999, updateData)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    test('should delete existing project', async () => {
      const projectId = await global.testUtils.createTestProject('To Delete');

      await projectService.delete(projectId);

      const project = await projectService.getById(projectId);
      expect(project).toBeNull();
    });

    test('should delete project with related data', async () => {
      const projectId = await global.testUtils.createTestProject('With Pages');
      await global.testUtils.createTestPage(projectId, 1);
      await global.testUtils.createTestPage(projectId, 2);
      await global.testUtils.createTestAsset(projectId);

      await projectService.delete(projectId);

      const project = await projectService.getById(projectId);
      expect(project).toBeNull();
      
      // Verify related data is also deleted
      const db = global.testUtils.getTestDatabase().getDatabase();
      
      const pages = db.prepare('SELECT * FROM pages WHERE project_id = ?').all(projectId);
      expect(pages.length).toBe(0);
      
      const assets = db.prepare('SELECT * FROM assets WHERE project_id = ?').all(projectId);
      expect(assets.length).toBe(0);
    });

    test('should reject delete for non-existent project', async () => {
      await expect(projectService.delete(99999)).rejects.toThrow();
    });
  });

  describe('search', () => {
    test('should find projects by name', async () => {
      await global.testUtils.createTestProject('Searchable Project');
      await global.testUtils.createTestProject('Other Project');

      const results = await projectService.search('Searchable');

      expect(results.length).toBe(1);
      expect(results[0].name).toContain('Searchable');
    });

    test('should find projects by description', async () => {
      const db = global.testUtils.getTestDatabase().getDatabase();
      
      db.prepare(`
        INSERT INTO projects (name, description) VALUES (?, ?)
      `).run('Test', 'Special description content');

      const results = await projectService.search('Special');

      expect(results.length).toBe(1);
      expect(results[0].description).toContain('Special');
    });

    test('should return empty array for no matches', async () => {
      await global.testUtils.createTestProject('Different Project');

      const results = await projectService.search('NonExistent');

      expect(results.length).toBe(0);
    });
  });

  describe('updateLastAccessed', () => {
    test('should update last accessed timestamp', async () => {
      const projectId = await global.testUtils.createTestProject('Test Project');
      
      const originalProject = await projectService.getById(projectId);
      const originalTimestamp = originalProject!.last_accessed;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      await projectService.updateLastAccessed(projectId);

      const updatedProject = await projectService.getById(projectId);
      expect(updatedProject!.last_accessed).not.toBe(originalTimestamp);
    });
  });

  describe('count', () => {
    test('should count all projects', async () => {
      await global.testUtils.createTestProject('Project 1');
      await global.testUtils.createTestProject('Project 2');

      const count = await projectService.count();
      expect(count).toBe(2);
    });

    test('should count filtered projects', async () => {
      await global.testUtils.createTestProject('Filtered Project');
      await global.testUtils.createTestProject('Other Project');

      const count = await projectService.count({ name: 'Filtered Project' });
      expect(count).toBe(1);
    });
  });
});