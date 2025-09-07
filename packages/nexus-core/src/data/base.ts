import type {
	DataSource,
	ConnectionConfig,
	DatabaseSchema,
	TableSchema,
	Query,
	QueryResult,
	WhereClause,
	OrderClause,
	Transaction,
	DataSourceCapabilities,
	TableSchemaChange,
	Record
} from './types';
import { ConnectionError, QueryError, SchemaError } from './types';

/**
 * Abstract base class for all data source implementations
 * Provides common functionality and enforces the DataSource interface
 */
export abstract class BaseDataSource implements DataSource {
	protected _connected = false;
	protected _config?: ConnectionConfig;

	constructor(
		public readonly id: string,
		public readonly name: string,
		public readonly type: string,
		public readonly capabilities: DataSourceCapabilities
	) {}

	// Connection management (abstract - must be implemented by subclasses)
	abstract connect(config: ConnectionConfig): Promise<void>;
	abstract disconnect(): Promise<void>;
	abstract ping(): Promise<boolean>;

	isConnected(): boolean {
		return this._connected;
	}

	protected assertConnected(): void {
		if (!this._connected) {
			throw new ConnectionError('Data source is not connected');
		}
	}

	// Schema operations (abstract)
	abstract getSchema(): Promise<DatabaseSchema>;
	abstract getTableSchema(tableName: string): Promise<TableSchema>;
	abstract createTable(schema: TableSchema): Promise<void>;
	abstract dropTable(tableName: string): Promise<void>;
	abstract alterTable(tableName: string, changes: TableSchemaChange[]): Promise<void>;

	// Query operations (abstract)
	abstract query<T = Record>(query: Query): Promise<QueryResult<T>>;
	abstract rawQuery<T = Record>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;

	// CRUD helpers - default implementations using query()
	async findOne<T = Record>(table: string, where: WhereClause[]): Promise<T | null> {
		this.assertConnected();

		const result = await this.query<T>({
			table,
			operation: 'select',
			where,
			limit: 1
		});

		return result.data[0] || null;
	}

	async findMany<T = Record>(
		table: string,
		options: {
			where?: WhereClause[];
			orderBy?: OrderClause[];
			limit?: number;
			offset?: number;
		} = {}
	): Promise<QueryResult<T>> {
		this.assertConnected();

		return this.query<T>({
			table,
			operation: 'select',
			where: options.where,
			orderBy: options.orderBy,
			limit: options.limit,
			offset: options.offset
		});
	}

	async create<T = Record>(table: string, data: Partial<T>): Promise<T> {
		this.assertConnected();

		const result = await this.query<T>({
			table,
			operation: 'insert',
			data: data as Record
		});

		if (result.data.length === 0) {
			throw new QueryError('Insert operation did not return data');
		}

		return result.data[0];
	}

	async update<T = Record>(table: string, where: WhereClause[], data: Partial<T>): Promise<T[]> {
		this.assertConnected();

		const result = await this.query<T>({
			table,
			operation: 'update',
			where,
			data: data as Record
		});

		return result.data;
	}

	async delete(table: string, where: WhereClause[]): Promise<number> {
		this.assertConnected();

		const result = await this.query({
			table,
			operation: 'delete',
			where
		});

		return result.affected || 0;
	}

	// Transaction support (abstract)
	abstract beginTransaction(): Promise<Transaction>;
	abstract withTransaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T>;

	// Utility methods
	async exists(table: string, where: WhereClause[]): Promise<boolean> {
		const count = await this.count(table, where);
		return count > 0;
	}

	async count(table: string, where?: WhereClause[]): Promise<number> {
		this.assertConnected();

		const result = await this.query({
			table,
			operation: 'select',
			fields: ['COUNT(*) as count'],
			where
		});

		return Number(result.data[0]?.count || 0);
	}

	// Bulk operations (optional - can be overridden by subclasses)
	async bulkInsert?<T = Record>(table: string, data: Partial<T>[]): Promise<QueryResult<T>> {
		if (!this.capabilities.supportsBulkOperations) {
			// Fallback to individual inserts
			const results: T[] = [];
			for (const item of data) {
				const result = await this.create<T>(table, item);
				results.push(result);
			}
			return { data: results, count: results.length };
		}

		// Subclass should override this for true bulk support
		throw new QueryError('Bulk insert not implemented for this data source');
	}

	async bulkUpdate?<T = Record>(
		table: string, 
		data: Array<{ where: WhereClause[], data: Partial<T> }>
	): Promise<QueryResult<T>> {
		if (!this.capabilities.supportsBulkOperations) {
			// Fallback to individual updates
			const results: T[] = [];
			for (const item of data) {
				const result = await this.update<T>(table, item.where, item.data);
				results.push(...result);
			}
			return { data: results, count: results.length };
		}

		throw new QueryError('Bulk update not implemented for this data source');
	}

	async bulkDelete?(table: string, whereConditions: WhereClause[][]): Promise<number> {
		if (!this.capabilities.supportsBulkOperations) {
			// Fallback to individual deletes
			let totalDeleted = 0;
			for (const where of whereConditions) {
				const deleted = await this.delete(table, where);
				totalDeleted += deleted;
			}
			return totalDeleted;
		}

		throw new QueryError('Bulk delete not implemented for this data source');
	}

	// Helper methods for subclasses
	protected validateTableName(tableName: string): void {
		if (!tableName || typeof tableName !== 'string') {
			throw new SchemaError('Table name must be a non-empty string');
		}
		
		if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(tableName)) {
			throw new SchemaError('Table name contains invalid characters');
		}
	}

	protected validateQuery(query: Query): void {
		if (!query.table) {
			throw new QueryError('Query must specify a table');
		}

		this.validateTableName(query.table);

		if (!['select', 'insert', 'update', 'delete'].includes(query.operation)) {
			throw new QueryError(`Invalid query operation: ${query.operation}`);
		}

		if (query.operation === 'insert' && !query.data) {
			throw new QueryError('Insert operation requires data');
		}

		if (query.operation === 'update' && (!query.data || !query.where)) {
			throw new QueryError('Update operation requires data and where conditions');
		}

		if (query.operation === 'delete' && !query.where) {
			throw new QueryError('Delete operation requires where conditions');
		}
	}

	protected buildWhereClause(where: WhereClause[]): string {
		// This is a basic implementation - subclasses should override for database-specific syntax
		return where
			.map(clause => {
				const { field, operator } = clause;
				
				switch (operator) {
					case 'eq': return `${field} = ?`;
					case 'ne': return `${field} != ?`;
					case 'gt': return `${field} > ?`;
					case 'gte': return `${field} >= ?`;
					case 'lt': return `${field} < ?`;
					case 'lte': return `${field} <= ?`;
					case 'like': return `${field} LIKE ?`;
					case 'in': return `${field} IN (?)`;
					case 'notin': return `${field} NOT IN (?)`;
					case 'isnull': return `${field} IS NULL`;
					case 'isnotnull': return `${field} IS NOT NULL`;
					default: throw new QueryError(`Unsupported operator: ${operator}`);
				}
			})
			.join(' AND ');
	}

	protected buildOrderClause(orderBy: OrderClause[]): string {
		return orderBy
			.map(clause => `${clause.field} ${clause.direction.toUpperCase()}`)
			.join(', ');
	}
}