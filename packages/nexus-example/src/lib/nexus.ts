import { NexusKernel, LogLevel } from '@nexus/core';
import type { NexusPlugin, DataSourceConfig, AuthProviderConfig, PluginContext } from '@nexus/core';

// Create global Nexus kernel instance
export const kernel = new NexusKernel({
	logLevel: LogLevel.INFO,
	config: {
		app: {
			name: 'Nexus SvelteKit Admin',
			version: '1.0.0',
			environment: 'development',
			debug: true,
			baseUrl: 'http://localhost:5173'
		},
		security: {
			csrf: true,
			cors: {
				enabled: true
			}
		},
		ui: {
			theme: 'modern',
			primaryColor: '#3b82f6',
			components: {
				layout: 'sidebar',
				navigation: { autoGenerate: true }
			}
		}
	}
});

// PostgreSQL Plugin
export const postgresPlugin: NexusPlugin = {
	id: 'postgres',
	name: 'PostgreSQL Database',
	version: '1.0.0',
	hooks: {
		onLoad: async (context: PluginContext) => {
			const config: DataSourceConfig = {
				id: 'postgres-main',
				name: 'Main Database',
				adapter: '@nexus/postgres-adapter',
				enabled: true,
				config: {
					host: 'localhost',
					port: 5432,
					database: 'nexus_admin',
					username: 'admin',
					password: '***hidden***'
				},
				metadata: {
					capabilities: ['crud', 'transactions', 'joins']
				}
			};

			context.container.resolve('nexus:config').registerDataSource(config);
			context.logger.info('PostgreSQL database configured');
		}
	}
};

// Auth0 Plugin
export const auth0Plugin: NexusPlugin = {
	id: 'auth0',
	name: 'Auth0 Authentication',
	version: '1.0.0',
	hooks: {
		onLoad: async (context: PluginContext) => {
			const config: AuthProviderConfig = {
				id: 'auth0',
				name: 'Auth0 SSO',
				adapter: '@nexus/auth0-adapter',
				enabled: true,
				priority: 100,
				config: {
					domain: 'your-tenant.auth0.com',
					clientId: 'your-client-id',
					audience: 'https://api.yourapp.com'
				}
			};

			context.container.resolve('nexus:config').registerAuthProvider(config);
			context.logger.info('Auth0 authentication configured');
		}
	}
};

// Mock Data Plugin for demo
export const mockDataPlugin: NexusPlugin = {
	id: 'mock-data',
	name: 'Mock Data Provider',
	version: '1.0.0',
	hooks: {
		onLoad: async (context: PluginContext) => {
			const mockUsers = [
				{ id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', active: true },
				{ id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', active: true },
				{ id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'user', active: false },
				{ id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'moderator', active: true }
			];

			const mockStats = {
				totalUsers: mockUsers.length,
				activeUsers: mockUsers.filter((u) => u.active).length,
				adminUsers: mockUsers.filter((u) => u.role === 'admin').length,
				revenue: '$45,280',
				growth: '+12.5%'
			};

			context.container.registerSingleton('data:users', mockUsers);
			context.container.registerSingleton('data:stats', mockStats);
			context.logger.info('Mock data loaded');
		}
	}
};

// Initialize kernel
let initialized = false;

export async function initializeNexus() {
	if (initialized) return;

	console.log('Initializing Nexus kernel...');

	await kernel.registerPlugin(postgresPlugin);
	await kernel.registerPlugin(auth0Plugin);
	await kernel.registerPlugin(mockDataPlugin);
	await kernel.bootstrap();

	initialized = true;
	console.log('Nexus kernel ready!');
}

export function getNexusData() {
	const container = kernel.getContainer();
	const config = kernel.getConfiguration();

	try {
		return {
			users: container.resolve('data:users'),
			stats: container.resolve('data:stats'),
			config: config,
			dataSources: Object.keys(config.plugins.registry.dataSources),
			authProviders: Object.keys(config.plugins.registry.authProviders)
		};
	} catch (error) {
		console.error('Error getting Nexus data:', error);
		return {
			users: [],
			stats: {},
			config: {},
			dataSources: [],
			authProviders: []
		};
	}
}
