// Main exports for @nexus/core
export { NexusKernel } from './kernel/index';
export { DIContainer } from './kernel/container';
export { EventBus } from './kernel/event-bus';
export { Logger, LogLevel } from './kernel/logger';
export { ConfigManager } from './kernel/config';

// Plugin system exports
export type {
	NexusPlugin,
	PluginContext,
	PluginHooks,
	DataSourceConfig,
	AuthProviderConfig
} from './plugins/types';

// Data layer exports
export {
	BaseDataSource,
	DataSourceManager,
	DataSourceError,
	ConnectionError,
	QueryError,
	SchemaError,
	TransactionError,
	QueryBuilder,
	SchemaUtils,
	DataUtils
} from './data/index';

export type {
	DataSource,
	Query,
	QueryResult,
	WhereClause,
	OrderClause,
	Transaction,
	DatabaseSchema,
	TableSchema,
	FieldSchema,
	ConnectionConfig,
	DataSourceCapabilities,
	FieldType,
	FieldValue,
	PrimaryKey
} from './data/index';

// Re-export main types
export type { NexusConfig, NexusKernelOptions } from './kernel/types';
