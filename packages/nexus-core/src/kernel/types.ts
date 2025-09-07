import type { LogLevel } from './logger';

export interface NexusConfig {
	app: {
		name: string;
		version: string;
		environment: 'development' | 'staging' | 'production';
		debug?: boolean;
		baseUrl?: string;
	};
	plugins: {
		registry: {
			dataSources: Record<string, any>;
			authProviders: Record<string, any>;
		};
	};
	security?: {
		csrf?: boolean;
		cors?: {
			enabled: boolean;
			origins?: string[];
			credentials?: boolean;
		};
		rateLimit?: {
			enabled: boolean;
			windowMs?: number;
			maxRequests?: number;
		};
		session?: {
			timeout?: number;
			secure?: boolean;
			sameSite?: 'strict' | 'lax' | 'none';
		};
	};
	ui?: {
		theme?: string;
		primaryColor?: string;
		components?: {
			layout?: string;
			navigation?: any;
			branding?: any;
		};
	};
}

export interface NexusKernelOptions {
	logLevel?: LogLevel;
	config?: Partial<NexusConfig>;
}
