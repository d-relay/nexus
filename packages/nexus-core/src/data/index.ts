// Core data interfaces and types
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
	IndexSchema,
	RelationSchema,
	ConnectionConfig,
	DataSourceCapabilities,
	TableSchemaChange,
	FieldType,
	FieldValue,
	PrimaryKey,
	Record,
	TableMetadata,
	FieldMetadata
} from './types';

// Error classes
export {
	DataSourceError,
	ConnectionError,
	QueryError,
	SchemaError,
	TransactionError
} from './types';

// Base implementations
export { BaseDataSource } from './base';
export { DataSourceManager } from './manager';

// Utility functions
export * from './utils';