import { NexusKernel, LogLevel } from '@nexus/core';
import type { NexusPlugin, DataSourceConfig, AuthProviderConfig, PluginContext } from '@nexus/core';

/**
 * Main demonstration of Nexus architecture
 * Shows how different companies can use different tech stacks
 */

// ============== PostgreSQL Adapter Plugin ==============
const postgresAdapter: NexusPlugin = {
	id: 'postgres-adapter',
	name: 'PostgreSQL Adapter',
	version: '1.0.0',
	description: 'Production-grade PostgreSQL integration',
	hooks: {
		onLoad: async (context: PluginContext) => {
			context.logger.info('🐘 Initializing PostgreSQL adapter');

			const config: DataSourceConfig = {
				id: 'postgres-main',
				name: 'PostgreSQL Database',
				adapter: '@nexus/postgres-adapter',
				enabled: true,
				config: {
					host: process.env.DB_HOST || 'localhost',
					port: 5432,
					database: process.env.DB_NAME || 'nexus_demo',
					username: process.env.DB_USER || 'postgres',
					password: process.env.DB_PASS || 'password',
					ssl: process.env.NODE_ENV === 'production'
				},
				metadata: {
					description: 'Main PostgreSQL database',
					capabilities: ['crud', 'transactions', 'joins', 'json', 'full-text-search']
				}
			};

			const configManager = context.container.resolve<any>('nexus:config');
			configManager.registerDataSource(config);

			// Mock database service
			context.container.registerSingleton('db:postgres', {
				async query(sql: string, params?: any[]) {
					context.logger.debug(`SQL: ${sql}`, params);
					return { rows: [], rowCount: 0 };
				}
			});
		}
	}
};

// ============== MongoDB Adapter Plugin ==============
const mongoAdapter: NexusPlugin = {
	id: 'mongo-adapter',
	name: 'MongoDB Adapter',
	version: '1.0.0',
	description: 'NoSQL database integration',
	hooks: {
		onLoad: async (context: PluginContext) => {
			context.logger.info('🍃 Initializing MongoDB adapter');

			const config: DataSourceConfig = {
				id: 'mongo-main',
				name: 'MongoDB Cluster',
				adapter: '@nexus/mongodb-adapter',
				enabled: true,
				config: {
					connectionString: process.env.MONGODB_URL || 'mongodb://localhost:27017/nexus_demo',
					options: { maxPoolSize: 10 }
				},
				metadata: {
					capabilities: ['crud', 'aggregation', 'full-text-search', 'geospatial']
				}
			};

			const configManager = context.container.resolve<any>('nexus:config');
			configManager.registerDataSource(config);
		}
	}
};

// ============== Auth0 Plugin ==============
const auth0Adapter: NexusPlugin = {
	id: 'auth0-adapter',
	name: 'Auth0 SSO',
	version: '1.0.0',
	hooks: {
		onLoad: async (context: PluginContext) => {
			context.logger.info('🔐 Initializing Auth0 SSO');

			const config: AuthProviderConfig = {
				id: 'auth0',
				name: 'Auth0 Single Sign-On',
				adapter: '@nexus/auth0-adapter',
				enabled: true,
				priority: 100,
				config: {
					domain: process.env.AUTH0_DOMAIN || 'demo.auth0.com',
					clientId: process.env.AUTH0_CLIENT_ID || 'demo-client-id',
					audience: process.env.AUTH0_AUDIENCE || 'https://api.demo.com'
				},
				metadata: {
					features: ['sso', 'mfa', 'social-login', 'rbac', 'user-management']
				}
			};

			const configManager = context.container.resolve<any>('nexus:config');
			configManager.registerAuthProvider(config);
		}
	}
};

// ============== Local Auth Plugin ==============
const localAuthAdapter: NexusPlugin = {
	id: 'local-auth-adapter',
	name: 'Local Authentication',
	version: '1.0.0',
	hooks: {
		onLoad: async (context: PluginContext) => {
			context.logger.info('🔑 Initializing local authentication');

			const config: AuthProviderConfig = {
				id: 'local',
				name: 'Email/Password Authentication',
				adapter: '@nexus/local-auth-adapter',
				enabled: true,
				priority: 50,
				config: {
					bcryptRounds: 10,
					sessionDuration: '24h',
					passwordPolicy: {
						minLength: 8,
						requireUppercase: true,
						requireNumbers: true,
						requireSpecialChars: true
					}
				},
				metadata: {
					features: ['registration', 'password-reset', 'email-verification']
				}
			};

			const configManager = context.container.resolve<any>('nexus:config');
			configManager.registerAuthProvider(config);
		}
	}
};

// ============== Demo Scenarios ==============

async function runEnterpriseScenario() {
	console.log('\n📊 ENTERPRISE SCENARIO');
	console.log('Stack: PostgreSQL + Auth0 + Material-UI');
	console.log('─'.repeat(50));

	const kernel = new NexusKernel({
		logLevel: LogLevel.INFO,
		config: {
			app: {
				name: 'Enterprise Admin Portal',
				version: '2.0.0',
				environment: 'production',
				debug: false,
				baseUrl: 'https://admin.enterprise.com'
			},
			security: {
				csrf: true,
				cors: {
					enabled: true,
					origins: ['https://enterprise.com'],
					credentials: true
				},
				rateLimit: {
					enabled: true,
					windowMs: 60000,
					maxRequests: 100
				},
				session: {
					timeout: 8 * 60 * 60 * 1000, // 8 hours
					secure: true,
					sameSite: 'strict'
				}
			},
			ui: {
				theme: 'enterprise-blue',
				primaryColor: '#1976d2',
				components: {
					layout: 'sidebar',
					navigation: { autoGenerate: true },
					branding: {
						title: 'Enterprise Portal',
						logo: '/assets/logo.svg'
					}
				}
			}
		}
	});

	await kernel.registerPlugin(postgresAdapter);
	await kernel.registerPlugin(auth0Adapter);
	await kernel.bootstrap();

	const config = kernel.getConfiguration();
	console.log('✅ Data Sources:', Object.keys(config.plugins.registry.dataSources));
	console.log('✅ Auth Providers:', Object.keys(config.plugins.registry.authProviders));
	console.log(
		'✅ Security: CSRF =',
		config.security.csrf,
		', Rate Limit =',
		config.security.rateLimit.enabled
	);

	await kernel.destroy();
}

async function runStartupScenario() {
	console.log('\n🚀 STARTUP SCENARIO');
	console.log('Stack: MongoDB + Local Auth + Tailwind CSS');
	console.log('─'.repeat(50));

	const kernel = new NexusKernel({
		logLevel: LogLevel.INFO,
		config: {
			app: {
				name: 'Startup Dashboard',
				version: '0.1.0',
				environment: 'development',
				debug: true,
				baseUrl: 'http://localhost:3000'
			},
			ui: {
				theme: 'modern-dark',
				components: {
					layout: 'topbar',
					navigation: { autoGenerate: true },
					branding: {
						title: 'Startup HQ'
					}
				}
			}
		}
	});

	await kernel.registerPlugin(mongoAdapter);
	await kernel.registerPlugin(localAuthAdapter);
	await kernel.bootstrap();

	const config = kernel.getConfiguration();
	console.log('✅ Data Sources:', Object.keys(config.plugins.registry.dataSources));
	console.log('✅ Auth Providers:', Object.keys(config.plugins.registry.authProviders));
	console.log('✅ Environment:', config.app.environment);

	await kernel.destroy();
}

async function runMultiTenantScenario() {
	console.log('\n🏢 MULTI-TENANT SaaS SCENARIO');
	console.log('Stack: PostgreSQL + MongoDB + Okta + Custom UI');
	console.log('─'.repeat(50));

	const kernel = new NexusKernel({
		logLevel: LogLevel.DEBUG,
		config: {
			app: {
				name: 'SaaS Platform Admin',
				version: '3.5.0',
				environment: 'production',
				debug: false,
				baseUrl: 'https://admin.saas-platform.io'
			}
		}
	});

	// Multi-database setup
	await kernel.registerPlugin(postgresAdapter); // For relational data
	await kernel.registerPlugin(mongoAdapter); // For document storage

	// Could add more auth providers
	await kernel.registerPlugin(auth0Adapter);

	await kernel.bootstrap();

	const config = kernel.getConfiguration();
	console.log('✅ Multiple Data Sources:', Object.keys(config.plugins.registry.dataSources));
	console.log('✅ Auth Stack:', Object.keys(config.plugins.registry.authProviders));

	await kernel.destroy();
}

// ============== Main Demo ==============
async function main() {
	console.log('🎯 NEXUS ADMIN FRAMEWORK - ARCHITECTURE DEMO');
	console.log('='.repeat(50));
	console.log('Demonstrating how different organizations can use');
	console.log('different technology stacks with the same core.');

	try {
		await runEnterpriseScenario();
		await runStartupScenario();
		await runMultiTenantScenario();

		console.log('\n' + '='.repeat(50));
		console.log('✨ KEY TAKEAWAYS:');
		console.log('1. Core is completely database/auth agnostic');
		console.log('2. Plugins provide specific implementations');
		console.log('3. Configuration is flexible and extensible');
		console.log('4. Same core, infinite possibilities');
		console.log('='.repeat(50));
	} catch (error) {
		console.error('Demo failed:', error);
		process.exit(1);
	}
}

// Run demo
if (import.meta.url.endsWith('/demo.ts')) {
	main().catch(console.error);
}