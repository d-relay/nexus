import { NexusKernel, LogLevel } from '@nexus/core';
import type { NexusPlugin, PluginContext, DataSourceConfig, AuthProviderConfig } from '@nexus/core';

/**
 * Startup setup example
 * Tech stack: MongoDB + Local Auth + Minimal config
 */

const kernel = new NexusKernel({
	logLevel: LogLevel.DEBUG,
	config: {
		app: {
			name: 'Startup Dashboard',
			version: '0.1.0',
			environment: 'development',
			debug: true,
			baseUrl: 'http://localhost:3000'
		},
		ui: {
			theme: 'modern',
			components: {
				layout: 'sidebar',
				navigation: { autoGenerate: true }
			}
		}
	}
});

// MongoDB for flexible schema
const mongoPlugin: NexusPlugin = {
	id: 'mongodb',
	name: 'MongoDB',
	version: '1.0.0',
	hooks: {
		onLoad: async (context: PluginContext) => {
			const config: DataSourceConfig = {
				id: 'mongo',
				name: 'MongoDB',
				adapter: '@nexus/mongodb-adapter',
				enabled: true,
				config: {
					connectionString: process.env.MONGODB_URL || 'mongodb://localhost:27017/startup_db',
					options: {
						maxPoolSize: 10,
						serverSelectionTimeoutMS: 5000
					}
				},
				metadata: {
					capabilities: ['crud', 'aggregation', 'full-text-search']
				}
			};

			context.container.resolve('nexus:config').registerDataSource(config);
			context.logger.info('MongoDB connected');
		}
	}
};

// Simple local authentication
const localAuthPlugin: NexusPlugin = {
	id: 'local-auth',
	name: 'Local Auth',
	version: '1.0.0',
	hooks: {
		onLoad: async (context: PluginContext) => {
			const config: AuthProviderConfig = {
				id: 'local',
				name: 'Email/Password',
				adapter: '@nexus/local-auth-adapter',
				enabled: true,
				priority: 50,
				config: {
					passwordMinLength: 8,
					sessionDuration: '7d',
					allowRegistration: true
				}
			};

			context.container.resolve<any>('nexus:config').registerAuthProvider(config);
			context.logger.info('Local authentication ready');
		}
	}
};

async function bootstrap() {
	console.log('🚀 Starting Startup Dashboard...\n');

	await kernel.registerPlugin(mongoPlugin);
	await kernel.registerPlugin(localAuthPlugin);
	await kernel.bootstrap();

	console.log('\n✅ Dashboard ready!');
	console.log('   - Database: MongoDB (Local)');
	console.log('   - Auth: Email/Password');
	console.log('   - Mode: Development');
	console.log('   - URL: http://localhost:3000');
}

bootstrap().catch(console.error);