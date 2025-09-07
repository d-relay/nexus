import { NexusKernel, LogLevel } from '@nexus/core';
import type { NexusPlugin, DataSourceConfig, AuthProviderConfig, PluginContext } from '@nexus/core';

/**
 * Enterprise setup example
 * Tech stack: PostgreSQL + Auth0 + Role-based access
 */

const kernel = new NexusKernel({
	logLevel: LogLevel.INFO,
	config: {
		app: {
			name: 'Enterprise Admin Portal',
			version: '1.0.0',
			environment: 'production',
			debug: false,
			baseUrl: 'https://admin.company.com'
		},
		security: {
			csrf: true,
			cors: {
				enabled: true,
				origins: ['https://company.com', 'https://app.company.com'],
				credentials: true
			},
			rateLimit: {
				enabled: true,
				windowMs: 60000,
				maxRequests: 100
			},
			session: {
				secret: process.env.SESSION_SECRET,
				timeout: 8 * 60 * 60 * 1000,
				secure: true,
				sameSite: 'strict'
			}
		}
	}
});

// PostgreSQL for structured data
const postgresPlugin: NexusPlugin = {
	id: 'postgres',
	name: 'PostgreSQL Database',
	version: '1.0.0',
	hooks: {
		onLoad: async (context: PluginContext) => {
			const config: DataSourceConfig = {
				id: 'main-db',
				name: 'Production Database',
				adapter: '@nexus/postgres-adapter',
				enabled: true,
				config: {
					host: process.env.DB_HOST,
					port: 5432,
					database: process.env.DB_NAME,
					username: process.env.DB_USER,
					password: process.env.DB_PASSWORD,
					ssl: true,
					poolSize: 20
				}
			};

			context.container.resolve<any>('nexus:config').registerDataSource(config);
			context.logger.info('PostgreSQL configured for production');
		}
	}
};

// Auth0 for enterprise SSO
const auth0Plugin: NexusPlugin = {
	id: 'auth0',
	name: 'Auth0 SSO',
	version: '1.0.0',
	hooks: {
		onLoad: async (context: PluginContext) => {
			const config: AuthProviderConfig = {
				id: 'auth0-sso',
				name: 'Company SSO',
				adapter: '@nexus/auth0-adapter',
				enabled: true,
				priority: 100,
				config: {
					domain: process.env.AUTH0_DOMAIN,
					clientId: process.env.AUTH0_CLIENT_ID,
					clientSecret: process.env.AUTH0_CLIENT_SECRET,
					audience: process.env.AUTH0_AUDIENCE,
					scope: 'openid profile email roles'
				},
				metadata: {
					features: ['sso', 'mfa', 'rbac', 'audit-logs']
				}
			};

			context.container.resolve<any>('nexus:config').registerAuthProvider(config);
			context.logger.info('Auth0 SSO configured');
		}
	}
};

async function bootstrap() {
	console.log('🏢 Starting Enterprise Admin Portal...\n');

	await kernel.registerPlugin(postgresPlugin);
	await kernel.registerPlugin(auth0Plugin);
	await kernel.bootstrap();

	console.log('✅ Enterprise portal ready!');
	console.log('   - Database: PostgreSQL (Production)');
	console.log('   - Auth: Auth0 SSO with MFA');
	console.log('   - Security: CSRF + Rate Limiting enabled');
	console.log('   - Session: 8-hour timeout, secure cookies');
}

bootstrap().catch(console.error);
