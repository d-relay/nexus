import type { DIContainer } from '../kernel/container';
import type { EventBus } from '../kernel/event-bus';
import type { Logger } from '../kernel/logger';

export interface NexusPlugin {
	id: string;
	name: string;
	version: string;
	description?: string;
	hooks: PluginHooks;
}

export interface PluginHooks {
	onLoad?: (context: PluginContext) => Promise<void> | void;
	onUnload?: (context: PluginContext) => Promise<void> | void;
	onInit?: (context: PluginContext) => Promise<void> | void;
	onDestroy?: (context: PluginContext) => Promise<void> | void;
}

export interface PluginContext {
	plugin: NexusPlugin;
	container: DIContainer;
	eventBus: EventBus;
	logger: Logger;
}

// Re-export config types from kernel
export type { DataSourceConfig, AuthProviderConfig } from '../kernel/config';
