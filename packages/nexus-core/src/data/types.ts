import type { z } from 'zod';

// Core data types
export type PrimaryKey = string | number;
export type FieldValue = unknown;
export type Record = { [field: string]: FieldValue };

// Query operations
export interface Query {
	table: string;
	operation: 'select' | 'insert' | 'update' | 'delete';
	fields?: string[];
	where?: WhereClause[];
	orderBy?: OrderClause[];
	limit?: number;
	offset?: number;
	data?: Record | Record[];
}

export interface WhereClause {
	field: string;
	operator:
		| 'eq'
		| 'ne'
		| 'gt'
		| 'gte'
		| 'lt'
		| 'lte'
		| 'like'
		| 'in'
		| 'notin'
		| 'isnull'
		| 'isnotnull';
	value: FieldValue;
}

export interface OrderClause {
	field: string;
	direction: 'asc' | 'desc';
}

// Query results
export interface QueryResult<T = Record> {
	data: T[];
	count: number;
	affected?: number;
	insertId?: PrimaryKey;
}

// Schema definition
export interface TableSchema {
	name: string;
	fields: FieldSchema[];
	primaryKey: string[];
	indexes: IndexSchema[];
	relations: RelationSchema[];
	metadata?: TableMetadata;
}

export interface FieldSchema {
	name: string;
	type: FieldType;
	nullable: boolean;
	default?: FieldValue;
	autoIncrement?: boolean;
	unique?: boolean;
	length?: number;
	precision?: number;
	scale?: number;
	validation?: z.ZodSchema;
	metadata?: FieldMetadata;
}

export type FieldType =
	| 'string'
	| 'number'
	| 'boolean'
	| 'date'
	| 'datetime'
	| 'time'
	| 'uuid'
	| 'json'
	| 'text'
	| 'email'
	| 'url';

export interface IndexSchema {
	name: string;
	fields: string[];
	unique: boolean;
	type?: 'btree' | 'hash' | 'gin' | 'gist';
}

export interface RelationSchema {
	name: string;
	type: 'hasOne' | 'hasMany' | 'belongsTo' | 'manyToMany';
	localField: string;
	foreignTable: string;
	foreignField: string;
	throughTable?: string;
}

export interface TableMetadata {
	displayName?: string;
	description?: string;
	category?: string;
	tags?: string[];
	permissions?: {
		read?: string[];
		write?: string[];
		delete?: string[];
	};
}

export interface FieldMetadata {
	displayName?: string;
	description?: string;
	category?: string;
	widget?: string;
	readonly?: boolean;
	hidden?: boolean;
	searchable?: boolean;
	sortable?: boolean;
}

// Database schema
export interface DatabaseSchema {
	name: string;
	tables: TableSchema[];
	version?: string;
	metadata?: {
		description?: string;
		created?: Date;
		modified?: Date;
	};
}

// Connection configuration
export interface ConnectionConfig {
	host?: string;
	port?: number;
	database: string;
	username?: string;
	password?: string;
	ssl?:
		| boolean
		| {
				rejectUnauthorized?: boolean;
				ca?: string;
				cert?: string;
				key?: string;
		  };
	pool?: {
		min?: number;
		max?: number;
		acquireTimeoutMillis?: number;
		createTimeoutMillis?: number;
		destroyTimeoutMillis?: number;
		idleTimeoutMillis?: number;
		reapIntervalMillis?: number;
		createRetryIntervalMillis?: number;
	};
	options?: Record;
}

// Data source capabilities
export interface DataSourceCapabilities {
	supportsTransactions: boolean;
	supportsJoins: boolean;
	supportsFullText: boolean;
	supportsGeoSpatial: boolean;
	supportsJson: boolean;
	supportsAggregation: boolean;
	supportsBulkOperations: boolean;
	maxConnections?: number;
	maxQueryLength?: number;
	supportedTypes: FieldType[];
}

// Transaction interface
export interface Transaction {
	id: string;
	commit(): Promise<void>;
	rollback(): Promise<void>;
	query<T = Record>(query: Query): Promise<QueryResult<T>>;
}

// Core DataSource interface
export interface DataSource {
	readonly id: string;
	readonly name: string;
	readonly type: string;
	readonly capabilities: DataSourceCapabilities;

	// Connection management
	connect(config: ConnectionConfig): Promise<void>;
	disconnect(): Promise<void>;
	isConnected(): boolean;
	ping(): Promise<boolean>;

	// Schema operations
	getSchema(): Promise<DatabaseSchema>;
	getTableSchema(tableName: string): Promise<TableSchema>;
	createTable(schema: TableSchema): Promise<void>;
	dropTable(tableName: string): Promise<void>;
	alterTable(tableName: string, changes: TableSchemaChange[]): Promise<void>;

	// Query operations
	query<T = Record>(query: Query): Promise<QueryResult<T>>;
	rawQuery<T = Record>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;

	// CRUD helpers
	findOne<T = Record>(table: string, where: WhereClause[]): Promise<T | null>;
	findMany<T = Record>(
		table: string,
		options?: {
			where?: WhereClause[];
			orderBy?: OrderClause[];
			limit?: number;
			offset?: number;
		}
	): Promise<QueryResult<T>>;
	create<T = Record>(table: string, data: Partial<T>): Promise<T>;
	update<T = Record>(table: string, where: WhereClause[], data: Partial<T>): Promise<T[]>;
	delete(table: string, where: WhereClause[]): Promise<number>;

	// Transaction support
	beginTransaction(): Promise<Transaction>;
	withTransaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T>;

	// Utility methods
	exists(table: string, where: WhereClause[]): Promise<boolean>;
	count(table: string, where?: WhereClause[]): Promise<number>;

	// Bulk operations (if supported)
	bulkInsert?<T = Record>(table: string, data: Partial<T>[]): Promise<QueryResult<T>>;
	bulkUpdate?<T = Record>(
		table: string,
		data: Array<{ where: WhereClause[]; data: Partial<T> }>
	): Promise<QueryResult<T>>;
	bulkDelete?(table: string, where: WhereClause[][]): Promise<number>;
}

// Schema change operations
export interface TableSchemaChange {
	type: 'add_field' | 'drop_field' | 'modify_field' | 'add_index' | 'drop_index';
	field?: FieldSchema;
	fieldName?: string;
	index?: IndexSchema;
	indexName?: string;
}

// Error types
export class DataSourceError extends Error {
	constructor(
		message: string,
		public readonly code?: string,
		public readonly details?: unknown
	) {
		super(message);
		this.name = 'DataSourceError';
	}
}

export class ConnectionError extends DataSourceError {
	constructor(message: string, details?: unknown) {
		super(message, 'CONNECTION_ERROR', details);
		this.name = 'ConnectionError';
	}
}

export class QueryError extends DataSourceError {
	constructor(
		message: string,
		public readonly query?: Query | string,
		details?: unknown
	) {
		super(message, 'QUERY_ERROR', details);
		this.name = 'QueryError';
	}
}

export class SchemaError extends DataSourceError {
	constructor(message: string, details?: unknown) {
		super(message, 'SCHEMA_ERROR', details);
		this.name = 'SchemaError';
	}
}

export class TransactionError extends DataSourceError {
	constructor(message: string, details?: unknown) {
		super(message, 'TRANSACTION_ERROR', details);
		this.name = 'TransactionError';
	}
}
