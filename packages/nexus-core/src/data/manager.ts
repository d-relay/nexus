import type { DataSource, ConnectionConfig } from './types';
import { DataSourceError } from './types';
import type { Logger } from '../kernel/logger';
import type { EventBus } from '../kernel/event-bus';

/**
 * Data Source Manager
 * Manages multiple data sources and provides a unified interface
 */
export class DataSourceManager {
	private dataSources = new Map<string, DataSource>();
	private primaryDataSourceId?: string;

	constructor(
		private logger: Logger,
		private eventBus: EventBus
	) {}

	/**
	 * Register a data source
	 */
	register(dataSource: DataSource): void {
		if (this.dataSources.has(dataSource.id)) {
			throw new DataSourceError(`Data source with id '${dataSource.id}' is already registered`);
		}

		this.dataSources.set(dataSource.id, dataSource);
		this.logger.info(`Data source registered: ${dataSource.name} (${dataSource.id})`);

		this.eventBus.emit('datasource:registered', {
			id: dataSource.id,
			name: dataSource.name,
			type: dataSource.type
		});

		// Set as primary if it's the first one
		if (!this.primaryDataSourceId) {
			this.setPrimary(dataSource.id);
		}
	}

	/**
	 * Unregister a data source
	 */
	async unregister(id: string): Promise<void> {
		const dataSource = this.dataSources.get(id);
		if (!dataSource) {
			throw new DataSourceError(`Data source '${id}' not found`);
		}

		// Disconnect if connected
		if (dataSource.isConnected()) {
			await dataSource.disconnect();
		}

		this.dataSources.delete(id);
		this.logger.info(`Data source unregistered: ${dataSource.name} (${id})`);

		this.eventBus.emit('datasource:unregistered', { id });

		// Reset primary if this was the primary
		if (this.primaryDataSourceId === id) {
			this.primaryDataSourceId = undefined;

			// Set first available as primary
			const firstId = this.dataSources.keys().next().value;
			if (firstId) {
				this.setPrimary(firstId);
			}
		}
	}

	/**
	 * Get a data source by ID
	 */
	get(id: string): DataSource {
		const dataSource = this.dataSources.get(id);
		if (!dataSource) {
			throw new DataSourceError(`Data source '${id}' not found`);
		}
		return dataSource;
	}

	/**
	 * Get the primary data source
	 */
	getPrimary(): DataSource {
		if (!this.primaryDataSourceId) {
			throw new DataSourceError('No primary data source configured');
		}
		return this.get(this.primaryDataSourceId);
	}

	/**
	 * Set primary data source
	 */
	setPrimary(id: string): void {
		if (!this.dataSources.has(id)) {
			throw new DataSourceError(`Data source '${id}' not found`);
		}

		const oldPrimary = this.primaryDataSourceId;
		this.primaryDataSourceId = id;

		this.logger.info(`Primary data source set to: ${id}`);
		this.eventBus.emit('datasource:primary-changed', {
			oldPrimary,
			newPrimary: id
		});
	}

	/**
	 * Get all registered data sources
	 */
	getAll(): DataSource[] {
		return Array.from(this.dataSources.values());
	}

	/**
	 * Get data sources by type
	 */
	getByType(type: string): DataSource[] {
		return Array.from(this.dataSources.values()).filter((ds) => ds.type === type);
	}

	/**
	 * Check if a data source exists
	 */
	has(id: string): boolean {
		return this.dataSources.has(id);
	}

	/**
	 * Get connection status of all data sources
	 */
	getStatus(): Array<{ id: string; name: string; type: string; connected: boolean }> {
		return Array.from(this.dataSources.values()).map((ds) => ({
			id: ds.id,
			name: ds.name,
			type: ds.type,
			connected: ds.isConnected()
		}));
	}

	/**
	 * Connect a data source
	 */
	async connect(id: string, config: ConnectionConfig): Promise<void> {
		const dataSource = this.get(id);

		try {
			await dataSource.connect(config);
			this.logger.info(`Data source connected: ${dataSource.name} (${id})`);

			this.eventBus.emit('datasource:connected', {
				id,
				name: dataSource.name,
				type: dataSource.type
			});
		} catch (error) {
			this.logger.error(`Failed to connect data source ${id}:`, error);
			this.eventBus.emit('datasource:connection-failed', {
				id,
				error: error instanceof Error ? error.message : String(error)
			});
			throw error;
		}
	}

	/**
	 * Connect all data sources using their configurations
	 */
	async connectAll(configs: Record<string, ConnectionConfig>): Promise<void> {
		const promises = Array.from(this.dataSources.keys()).map(async (id) => {
			const config = configs[id];
			if (config) {
				await this.connect(id, config);
			} else {
				this.logger.warn(`No configuration found for data source: ${id}`);
			}
		});

		await Promise.allSettled(promises);
	}

	/**
	 * Disconnect a data source
	 */
	async disconnect(id: string): Promise<void> {
		const dataSource = this.get(id);

		if (dataSource.isConnected()) {
			await dataSource.disconnect();
			this.logger.info(`Data source disconnected: ${dataSource.name} (${id})`);

			this.eventBus.emit('datasource:disconnected', {
				id,
				name: dataSource.name
			});
		}
	}

	/**
	 * Disconnect all data sources
	 */
	async disconnectAll(): Promise<void> {
		const promises = Array.from(this.dataSources.values()).map(async (ds) => {
			if (ds.isConnected()) {
				await ds.disconnect();
			}
		});

		await Promise.allSettled(promises);
		this.logger.info('All data sources disconnected');
		this.eventBus.emit('datasource:all-disconnected');
	}

	/**
	 * Health check for all data sources
	 */
	async healthCheck(): Promise<Record<string, boolean>> {
		const results: Record<string, boolean> = {};

		const promises = Array.from(this.dataSources.entries()).map(async ([id, ds]) => {
			try {
				if (ds.isConnected()) {
					results[id] = await ds.ping();
				} else {
					results[id] = false;
				}
			} catch {
				results[id] = false;
			}
		});

		await Promise.allSettled(promises);
		return results;
	}

	/**
	 * Get summary information
	 */
	getSummary(): {
		total: number;
		connected: number;
		types: Record<string, number>;
		primary?: string;
	} {
		const dataSources = Array.from(this.dataSources.values());
		const types: Record<string, number> = {};

		for (const ds of dataSources) {
			types[ds.type] = (types[ds.type] || 0) + 1;
		}

		return {
			total: dataSources.length,
			connected: dataSources.filter((ds) => ds.isConnected()).length,
			types,
			primary: this.primaryDataSourceId
		};
	}

	/**
	 * Clear all data sources (disconnect and unregister)
	 */
	async clear(): Promise<void> {
		await this.disconnectAll();
		this.dataSources.clear();
		this.primaryDataSourceId = undefined;
		this.logger.info('All data sources cleared');
		this.eventBus.emit('datasource:cleared');
	}
}
