import { DIContainer } from './container';
import { EventBus } from './event-bus';
import { Logger, LogLevel } from './logger';
import { ConfigManager } from './config';
import type { NexusConfig, NexusKernelOptions } from './types';
import type { NexusPlugin, PluginContext } from '../plugins/types';

export class NexusKernel {
	private container: DIContainer;
	private eventBus: EventBus;
	private logger: Logger;
	private configManager: ConfigManager;
	private plugins: Map<string, NexusPlugin> = new Map();
	private initialized = false;

	constructor(options?: NexusKernelOptions) {
		const logLevel = options?.logLevel ?? LogLevel.INFO;

		this.logger = new Logger(logLevel);
		this.container = new DIContainer();
		this.eventBus = new EventBus();
		this.configManager = new ConfigManager(options?.config);

		// Register core services
		this.container.registerSingleton('nexus:kernel', this);
		this.container.registerSingleton('nexus:container', this.container);
		this.container.registerSingleton('nexus:event-bus', this.eventBus);
		this.container.registerSingleton('nexus:logger', this.logger);
		this.container.registerSingleton('nexus:config', this.configManager);

		this.logger.info('Nexus Kernel initialized');
	}

	async registerPlugin(plugin: NexusPlugin): Promise<void> {
		if (this.plugins.has(plugin.id)) {
			throw new Error(`Plugin '${plugin.id}' is already registered`);
		}

		this.logger.info(`Registering plugin: ${plugin.name} v${plugin.version}`);
		this.plugins.set(plugin.id, plugin);

		const context: PluginContext = {
			plugin,
			container: this.container,
			eventBus: this.eventBus,
			logger: this.logger
		};

		// Call onLoad hook
		if (plugin.hooks.onLoad) {
			await plugin.hooks.onLoad(context);
		}

		this.eventBus.emit('plugin:registered', { plugin });
	}

	async bootstrap(): Promise<void> {
		if (this.initialized) {
			throw new Error('Kernel is already initialized');
		}

		this.logger.info('Bootstrapping Nexus Kernel...');

		// Initialize all plugins
		for (const plugin of this.plugins.values()) {
			if (plugin.hooks.onInit) {
				const context: PluginContext = {
					plugin,
					container: this.container,
					eventBus: this.eventBus,
					logger: this.logger
				};
				await plugin.hooks.onInit(context);
			}
		}

		this.initialized = true;
		this.eventBus.emit('kernel:ready');
		this.logger.info('Nexus Kernel ready');
	}

	async destroy(): Promise<void> {
		this.logger.info('Destroying Nexus Kernel...');

		// Destroy all plugins
		for (const plugin of this.plugins.values()) {
			if (plugin.hooks.onDestroy) {
				const context: PluginContext = {
					plugin,
					container: this.container,
					eventBus: this.eventBus,
					logger: this.logger
				};
				await plugin.hooks.onDestroy(context);
			}
		}

		this.eventBus.emit('kernel:destroyed');
		this.initialized = false;
		this.logger.info('Nexus Kernel destroyed');
	}

	getContainer(): DIContainer {
		return this.container;
	}

	getConfiguration(): NexusConfig {
		return this.configManager.getConfig();
	}

	getEventBus(): EventBus {
		return this.eventBus;
	}

	getLogger(): Logger {
		return this.logger;
	}
}
