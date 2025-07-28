import Database from 'better-sqlite3';
import { DatabaseManager } from './database-manager';

export interface PoolConfig {
  maxConnections?: number;
  acquireTimeout?: number;
  createRetryInterval?: number;
  destroyTimeout?: number;
}

export interface PoolConnection {
  db: Database.Database;
  inUse: boolean;
  createdAt: Date;
  lastUsed: Date;
}

export class ConnectionPool {
  private connections: PoolConnection[] = [];
  private readonly config: Required<PoolConfig>;
  private readonly databaseManager: DatabaseManager;
  private destroyed = false;

  constructor(databaseManager: DatabaseManager, config: PoolConfig = {}) {
    this.databaseManager = databaseManager;
    this.config = {
      maxConnections: config.maxConnections || 5,
      acquireTimeout: config.acquireTimeout || 10000,
      createRetryInterval: config.createRetryInterval || 200,
      destroyTimeout: config.destroyTimeout || 5000
    };
  }

  /**
   * Get a database connection from the pool
   */
  async acquire(): Promise<Database.Database> {
    if (this.destroyed) {
      throw new Error('Connection pool has been destroyed');
    }

    const startTime = Date.now();
    
    while (Date.now() - startTime < this.config.acquireTimeout) {
      // Look for an available connection
      const availableConnection = this.connections.find(conn => !conn.inUse);
      
      if (availableConnection) {
        availableConnection.inUse = true;
        availableConnection.lastUsed = new Date();
        return availableConnection.db;
      }

      // Create new connection if under limit
      if (this.connections.length < this.config.maxConnections) {
        const connection = await this.createConnection();
        connection.inUse = true;
        this.connections.push(connection);
        return connection.db;
      }

      // Wait a bit before retrying
      await this.sleep(this.config.createRetryInterval);
    }

    throw new Error('Failed to acquire database connection: timeout exceeded');
  }

  /**
   * Release a database connection back to the pool
   */
  release(db: Database.Database): void {
    const connection = this.connections.find(conn => conn.db === db);
    
    if (connection) {
      connection.inUse = false;
      connection.lastUsed = new Date();
    }
  }

  /**
   * Execute a function with a connection from the pool
   */
  async withConnection<T>(callback: (db: Database.Database) => Promise<T>): Promise<T> {
    const db = await this.acquire();
    
    try {
      return await callback(db);
    } finally {
      this.release(db);
    }
  }

  /**
   * Execute a function with a connection from the pool (sync version)
   */
  async withConnectionSync<T>(callback: (db: Database.Database) => T): Promise<T> {
    const db = await this.acquire();
    
    try {
      return callback(db);
    } finally {
      this.release(db);
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    totalConnections: number;
    activeConnections: number;
    availableConnections: number;
    maxConnections: number;
  } {
    const activeConnections = this.connections.filter(conn => conn.inUse).length;
    
    return {
      totalConnections: this.connections.length,
      activeConnections,
      availableConnections: this.connections.length - activeConnections,
      maxConnections: this.config.maxConnections
    };
  }

  /**
   * Clean up idle connections
   */
  async cleanup(maxIdleTime: number = 300000): Promise<void> { // 5 minutes default
    const now = new Date();
    const connectionsToRemove: PoolConnection[] = [];

    for (const connection of this.connections) {
      if (!connection.inUse && 
          (now.getTime() - connection.lastUsed.getTime()) > maxIdleTime) {
        connectionsToRemove.push(connection);
      }
    }

    for (const connection of connectionsToRemove) {
      try {
        connection.db.close();
        this.connections = this.connections.filter(conn => conn !== connection);
        console.log('Closed idle database connection');
      } catch (error) {
        console.error('Error closing idle connection:', error);
      }
    }
  }

  /**
   * Destroy the connection pool
   */
  async destroy(): Promise<void> {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;

    // Wait for active connections to be released or timeout
    const startTime = Date.now();
    while (this.hasActiveConnections() && 
           Date.now() - startTime < this.config.destroyTimeout) {
      await this.sleep(100);
    }

    // Force close all connections
    for (const connection of this.connections) {
      try {
        connection.db.close();
      } catch (error) {
        console.error('Error closing connection during pool destruction:', error);
      }
    }

    this.connections = [];
    console.log('Connection pool destroyed');
  }

  /**
   * Test all connections in the pool
   */
  async testConnections(): Promise<{ healthy: number; failed: number }> {
    let healthy = 0;
    let failed = 0;

    for (const connection of this.connections) {
      try {
        // Simple test query
        connection.db.prepare('SELECT 1').get();
        healthy++;
      } catch (error) {
        failed++;
        console.error('Connection test failed:', error);
      }
    }

    return { healthy, failed };
  }

  private async createConnection(): Promise<PoolConnection> {
    try {
      // Create a new database connection using the same configuration
      const db = this.databaseManager.getDatabase();
      
      return {
        db,
        inUse: false,
        createdAt: new Date(),
        lastUsed: new Date()
      };
    } catch (error) {
      console.error('Failed to create database connection:', error);
      throw error;
    }
  }

  private hasActiveConnections(): boolean {
    return this.connections.some(conn => conn.inUse);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance for application-wide use
let globalConnectionPool: ConnectionPool | null = null;

export function getConnectionPool(databaseManager: DatabaseManager, config?: PoolConfig): ConnectionPool {
  if (!globalConnectionPool) {
    globalConnectionPool = new ConnectionPool(databaseManager, config);
  }
  return globalConnectionPool;
}

export async function destroyGlobalConnectionPool(): Promise<void> {
  if (globalConnectionPool) {
    await globalConnectionPool.destroy();
    globalConnectionPool = null;
  }
}