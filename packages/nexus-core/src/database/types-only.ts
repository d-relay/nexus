/**
 * Database types and configuration without actual driver imports
 * This allows the package to compile without having all drivers installed
 */

export type DatabaseDriver = 'pg' | 'postgres' | 'mysql2' | 'better-sqlite3';

export interface DatabaseConfig {
	driver: DatabaseDriver;
	connectionString?: string;
	host?: string;
	port?: number;
	database?: string;
	username?: string;
	password?: string;
	ssl?: boolean;
	schema?: Record<string, unknown>;
	options?: Record<string, unknown>;
}

/**
 * Database connection manager interface
 */
export interface IDatabaseManager {
	connect(id: string, config: DatabaseConfig): Promise<any>;
	getDatabase(id: string): any;
	disconnect(id: string): Promise<void>;
	disconnectAll(): Promise<void>;
	listConnections(): Array<{ id: string; driver: DatabaseDriver; database?: string }>;
}

/**
 * Simple database connection manager
 * Actual implementations are lazy-loaded when drivers are available
 */
export class DatabaseManager implements IDatabaseManager {
	private connections = new Map<string, { db: any; client: any; config: DatabaseConfig }>();

	async connect(id: string, config: DatabaseConfig) {
		if (this.connections.has(id)) {
			throw new Error(`Database connection '${id}' already exists`);
		}

		// This is a placeholder - actual implementation should be provided by user
		// or by installing the appropriate drivers and using Drizzle directly
		throw new Error(`Database connection not implemented. Please implement database connection for driver: ${config.driver}`);
	}

	getDatabase(id: string) {
		const connection = this.connections.get(id);
		if (!connection) {
			throw new Error(`Database connection '${id}' not found`);
		}
		return connection.db;
	}

	async disconnect(id: string) {
		const connection = this.connections.get(id);
		if (!connection) return;

		const { client, config } = connection;
		
		try {
			switch (config.driver) {
				case 'pg':
				case 'mysql2':
					if (client?.end) await client.end();
					break;
				case 'postgres':
					if (client?.end) await client.end();
					break;
				case 'better-sqlite3':
					if (client?.close) client.close();
					break;
			}
		} catch (error) {
			console.warn(`Warning: Error closing database connection '${id}':`, error);
		}

		this.connections.delete(id);
	}

	async disconnectAll() {
		const ids = Array.from(this.connections.keys());
		await Promise.all(ids.map(id => this.disconnect(id)));
	}

	listConnections() {
		return Array.from(this.connections.entries()).map(([id, connection]) => ({
			id,
			driver: connection.config.driver,
			database: connection.config.database
		}));
	}
}

// Export singleton instance
export const databaseManager = new DatabaseManager();