import type { NexusConfig } from './types';

export interface DataSourceConfig {
	id: string;
	name: string;
	adapter: string;
	enabled: boolean;
	config: Record<string, unknown>;
	metadata?: Record<string, unknown>;
}

export interface AuthProviderConfig {
	id: string;
	name: string;
	adapter: string;
	enabled: boolean;
	priority: number;
	config: Record<string, unknown>;
	metadata?: Record<string, unknown>;
}

export class ConfigManager {
	private config: NexusConfig;

	constructor(initialConfig?: Partial<NexusConfig>) {
		this.config = this.createDefaultConfig();
		if (initialConfig) {
			this.mergeConfig(initialConfig);
		}
	}

	private createDefaultConfig(): NexusConfig {
		return {
			app: {
				name: 'Nexus Admin',
				version: '0.1.0',
				environment: 'development',
				debug: false,
				baseUrl: 'http://localhost:3000'
			},
			plugins: {
				registry: {
					dataSources: {},
					authProviders: {}
				}
			},
			security: {
				csrf: false,
				cors: {
					enabled: false
				},
				rateLimit: {
					enabled: false
				}
			},
			ui: {
				theme: 'default'
			}
		};
	}

	private mergeConfig(partial: Partial<NexusConfig>): void {
		this.config = {
			...this.config,
			...partial,
			app: {
				...this.config.app,
				...(partial.app || {})
			},
			plugins: {
				...this.config.plugins,
				...(partial.plugins || {}),
				registry: {
					...this.config.plugins.registry,
					...(partial.plugins?.registry || {})
				}
			},
			security: {
				...this.config.security,
				...(partial.security || {})
			},
			ui: {
				...this.config.ui,
				...(partial.ui || {})
			}
		};
	}

	registerDataSource(config: DataSourceConfig): void {
		this.config.plugins.registry.dataSources[config.id] = config;
	}

	registerAuthProvider(config: AuthProviderConfig): void {
		this.config.plugins.registry.authProviders[config.id] = config;
	}

	getConfig(): NexusConfig {
		return this.config;
	}
}
