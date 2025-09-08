/**
 * Schema Synchronization System
 * Works with existing databases - no migrations, only schema introspection and sync
 */

export interface SchemaSyncConfig {
	databaseUrl: string;
	driver: 'pg' | 'mysql2' | 'better-sqlite3';
	outputPath: string;
	schemaName?: string; // For PostgreSQL schemas
	includeViews?: boolean;
	includeFunctions?: boolean;
}

export interface TableInfo {
	name: string;
	columns: ColumnInfo[];
	primaryKeys: string[];
	foreignKeys: ForeignKeyInfo[];
	indexes: IndexInfo[];
	comment?: string;
}

export interface ColumnInfo {
	name: string;
	type: string;
	nullable: boolean;
	default?: any;
	autoIncrement?: boolean;
	length?: number;
	precision?: number;
	scale?: number;
	comment?: string;
}

export interface ForeignKeyInfo {
	columnName: string;
	referencedTable: string;
	referencedColumn: string;
	onDelete?: string;
	onUpdate?: string;
}

export interface IndexInfo {
	name: string;
	columns: string[];
	unique: boolean;
	type?: string;
}

/**
 * Schema Introspector - extracts schema from existing database
 */
export class SchemaIntrospector {
	constructor(private config: SchemaSyncConfig) {}

	/**
	 * Introspect database and get all table information
	 */
	async introspectDatabase(): Promise<TableInfo[]> {
		switch (this.config.driver) {
			case 'pg':
				return this.introspectPostgreSQL();
			case 'mysql2':
				return this.introspectMySQL();
			case 'better-sqlite3':
				return this.introspectSQLite();
			default:
				throw new Error(`Unsupported driver: ${this.config.driver}`);
		}
	}

	/**
	 * Generate Drizzle schema TypeScript code from database
	 */
	async generateDrizzleSchema(): Promise<string> {
		console.log('🔍 Introspecting database schema...');
		const tables = await this.introspectDatabase();
		
		console.log(`📋 Found ${tables.length} tables:`, tables.map(t => t.name));
		
		return this.generateTypeScriptSchema(tables);
	}

	/**
	 * Save generated schema to file
	 */
	async saveSchemaToFile(): Promise<void> {
		const schema = await this.generateDrizzleSchema();
		
		const fs = await import('fs/promises');
		const path = await import('path');
		
		// Ensure output directory exists
		const outputDir = path.dirname(this.config.outputPath);
		await fs.mkdir(outputDir, { recursive: true });
		
		await fs.writeFile(this.config.outputPath, schema, 'utf8');
		console.log(`✅ Schema saved to: ${this.config.outputPath}`);
	}

	private async introspectPostgreSQL(): Promise<TableInfo[]> {
		const { Pool } = await import('pg');
		const pool = new Pool({ connectionString: this.config.databaseUrl });

		try {
			const schemaName = this.config.schemaName || 'public';
			
			// Get all tables
			const tablesResult = await pool.query(`
				SELECT table_name, table_comment
				FROM information_schema.tables 
				WHERE table_schema = $1 AND table_type = 'BASE TABLE'
				ORDER BY table_name
			`, [schemaName]);

			const tables: TableInfo[] = [];

			for (const tableRow of tablesResult.rows) {
				const tableName = tableRow.table_name;
				
				// Get columns
				const columnsResult = await pool.query(`
					SELECT 
						column_name,
						data_type,
						udt_name,
						is_nullable,
						column_default,
						character_maximum_length,
						numeric_precision,
						numeric_scale,
						col_description(pgc.oid, ordinal_position) as comment
					FROM information_schema.columns c
					LEFT JOIN pg_class pgc ON pgc.relname = c.table_name
					WHERE table_schema = $1 AND table_name = $2
					ORDER BY ordinal_position
				`, [schemaName, tableName]);

				// Get primary keys
				const pkResult = await pool.query(`
					SELECT column_name
					FROM information_schema.key_column_usage k
					JOIN information_schema.table_constraints t 
						ON k.constraint_name = t.constraint_name
					WHERE t.table_schema = $1 AND t.table_name = $2 
						AND t.constraint_type = 'PRIMARY KEY'
					ORDER BY k.ordinal_position
				`, [schemaName, tableName]);

				// Get foreign keys
				const fkResult = await pool.query(`
					SELECT 
						kcu.column_name,
						ccu.table_name AS referenced_table,
						ccu.column_name AS referenced_column,
						rc.delete_rule,
						rc.update_rule
					FROM information_schema.key_column_usage kcu
					JOIN information_schema.referential_constraints rc 
						ON kcu.constraint_name = rc.constraint_name
					JOIN information_schema.constraint_column_usage ccu 
						ON rc.unique_constraint_name = ccu.constraint_name
					WHERE kcu.table_schema = $1 AND kcu.table_name = $2
				`, [schemaName, tableName]);

				// Get indexes
				const indexResult = await pool.query(`
					SELECT 
						i.relname as index_name,
						array_agg(a.attname ORDER BY c.ordinality) as columns,
						ix.indisunique as is_unique
					FROM pg_index ix
					JOIN pg_class i ON i.oid = ix.indexrelid
					JOIN pg_class t ON t.oid = ix.indrelid
					JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
					JOIN LATERAL unnest(ix.indkey) WITH ORDINALITY AS c(attnum, ordinality) ON c.attnum = a.attnum
					WHERE t.relname = $1 AND i.relname NOT LIKE '%_pkey'
					GROUP BY i.relname, ix.indisunique
				`, [tableName]);

				tables.push({
					name: tableName,
					columns: columnsResult.rows.map(col => ({
						name: col.column_name,
						type: this.mapPostgreSQLType(col.data_type, col.udt_name),
						nullable: col.is_nullable === 'YES',
						default: col.column_default,
						autoIncrement: col.column_default?.includes('nextval('),
						length: col.character_maximum_length,
						precision: col.numeric_precision,
						scale: col.numeric_scale,
						comment: col.comment
					})),
					primaryKeys: pkResult.rows.map(pk => pk.column_name),
					foreignKeys: fkResult.rows.map(fk => ({
						columnName: fk.column_name,
						referencedTable: fk.referenced_table,
						referencedColumn: fk.referenced_column,
						onDelete: fk.delete_rule,
						onUpdate: fk.update_rule
					})),
					indexes: indexResult.rows.map(idx => ({
						name: idx.index_name,
						columns: idx.columns,
						unique: idx.is_unique
					})),
					comment: tableRow.table_comment
				});
			}

			return tables;
		} finally {
			await pool.end();
		}
	}

	private async introspectMySQL(): Promise<TableInfo[]> {
		// MySQL introspection implementation
		throw new Error('MySQL introspection not yet implemented');
	}

	private async introspectSQLite(): Promise<TableInfo[]> {
		// SQLite introspection implementation  
		throw new Error('SQLite introspection not yet implemented');
	}

	private generateTypeScriptSchema(tables: TableInfo[]): string {
		const imports = this.generateImports();
		const tableDefs = tables.map(table => this.generateTableDefinition(table)).join('\n\n');
		const exports = this.generateExports(tables);

		return `${imports}\n\n${tableDefs}\n\n${exports}`;
	}

	private generateImports(): string {
		switch (this.config.driver) {
			case 'pg':
				return `import { pgTable, serial, varchar, text, boolean, integer, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';`;
			case 'mysql2':
				return `import { mysqlTable, serial, varchar, text, boolean, int, timestamp } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';`;
			case 'better-sqlite3':
				return `import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';`;
			default:
				return '';
		}
	}

	private generateTableDefinition(table: TableInfo): string {
		const tableFn = this.getTableFunction();
		const columns = table.columns.map(col => this.generateColumnDefinition(col)).join(',\n  ');
		
		return `export const ${table.name} = ${tableFn}('${table.name}', {
  ${columns}
});

export type ${this.capitalize(table.name)} = typeof ${table.name}.$inferSelect;
export type New${this.capitalize(table.name)} = typeof ${table.name}.$inferInsert;`;
	}

	private generateColumnDefinition(column: ColumnInfo): string {
		const drizzleType = this.mapToDrizzleType(column);
		let definition = `${column.name}: ${drizzleType}`;

		// Add constraints
		if (column.name === 'id' || column.autoIncrement) {
			definition += '.primaryKey()';
		}
		if (!column.nullable) {
			definition += '.notNull()';
		}
		if (column.default !== undefined && column.default !== null) {
			if (column.default === 'now()' || column.default.includes('CURRENT_TIMESTAMP')) {
				definition += '.defaultNow()';
			} else {
				definition += `.default(${JSON.stringify(column.default)})`;
			}
		}

		return definition;
	}

	private generateExports(tables: TableInfo[]): string {
		const tableNames = tables.map(t => t.name);
		return `// Export all tables
export const schema = {
  ${tableNames.join(',\n  ')}
};`;
	}

	private getTableFunction(): string {
		switch (this.config.driver) {
			case 'pg':
				return 'pgTable';
			case 'mysql2':
				return 'mysqlTable';
			case 'better-sqlite3':
				return 'sqliteTable';
			default:
				return 'pgTable';
		}
	}

	private mapPostgreSQLType(dataType: string, udtName: string): string {
		const type = dataType.toLowerCase();
		switch (type) {
			case 'character varying':
			case 'varchar':
			case 'char':
				return 'varchar';
			case 'text':
				return 'text';
			case 'integer':
			case 'bigint':
			case 'smallint':
				return 'integer';
			case 'boolean':
				return 'boolean';
			case 'timestamp':
			case 'timestamp without time zone':
			case 'timestamp with time zone':
				return 'timestamp';
			case 'uuid':
				return 'uuid';
			case 'jsonb':
			case 'json':
				return 'jsonb';
			default:
				return 'text'; // fallback
		}
	}

	private mapToDrizzleType(column: ColumnInfo): string {
		switch (column.type) {
			case 'varchar':
				return column.length ? `varchar('${column.name}', { length: ${column.length} })` : `varchar('${column.name}')`;
			case 'text':
				return `text('${column.name}')`;
			case 'integer':
				return column.autoIncrement ? `serial('${column.name}')` : `integer('${column.name}')`;
			case 'boolean':
				return `boolean('${column.name}')`;
			case 'timestamp':
				return `timestamp('${column.name}')`;
			case 'uuid':
				return `uuid('${column.name}')`;
			case 'jsonb':
				return `jsonb('${column.name}')`;
			default:
				return `text('${column.name}')`;
		}
	}

	private capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
}

/**
 * Create schema introspector
 */
export function createSchemaIntrospector(config: SchemaSyncConfig): SchemaIntrospector {
	return new SchemaIntrospector(config);
}

/**
 * Quick helper to generate schema from database URL
 */
export async function generateSchemaFromDatabase(
	databaseUrl: string, 
	outputPath: string, 
	driver: SchemaSyncConfig['driver'] = 'pg'
): Promise<void> {
	const introspector = createSchemaIntrospector({
		databaseUrl,
		outputPath,
		driver
	});

	await introspector.saveSchemaToFile();
}