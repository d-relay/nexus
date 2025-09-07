import type {
	FieldType,
	FieldSchema,
	TableSchema,
	WhereClause,
	OrderClause,
	Query,
	FieldValue
} from './types';

/**
 * Query builder utilities
 */
export class QueryBuilder {
	private query: Partial<Query> = {};

	constructor(table: string) {
		this.query.table = table;
	}

	static from(table: string): QueryBuilder {
		return new QueryBuilder(table);
	}

	select(fields?: string[]): this {
		this.query.operation = 'select';
		this.query.fields = fields;
		return this;
	}

	insert(data: Record<string, FieldValue>): this {
		this.query.operation = 'insert';
		this.query.data = data;
		return this;
	}

	update(data: Record<string, FieldValue>): this {
		this.query.operation = 'update';
		this.query.data = data;
		return this;
	}

	delete(): this {
		this.query.operation = 'delete';
		return this;
	}

	where(field: string, operator: WhereClause['operator'], value: FieldValue): this {
		if (!this.query.where) {
			this.query.where = [];
		}
		this.query.where.push({ field, operator, value });
		return this;
	}

	whereEq(field: string, value: FieldValue): this {
		return this.where(field, 'eq', value);
	}

	whereIn(field: string, values: FieldValue[]): this {
		return this.where(field, 'in', values);
	}

	whereLike(field: string, pattern: string): this {
		return this.where(field, 'like', pattern);
	}

	orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this {
		if (!this.query.orderBy) {
			this.query.orderBy = [];
		}
		this.query.orderBy.push({ field, direction });
		return this;
	}

	limit(limit: number): this {
		this.query.limit = limit;
		return this;
	}

	offset(offset: number): this {
		this.query.offset = offset;
		return this;
	}

	build(): Query {
		if (!this.query.operation) {
			throw new Error('Query operation not specified');
		}
		return this.query as Query;
	}
}

/**
 * Schema utilities
 */
export class SchemaUtils {
	/**
	 * Convert JavaScript type to FieldType
	 */
	static inferFieldType(value: unknown): FieldType {
		if (value === null || value === undefined) {
			return 'string'; // Default fallback
		}

		switch (typeof value) {
			case 'string':
				// Check for special string patterns
				if (isValidEmail(String(value))) return 'email';
				if (isValidUrl(String(value))) return 'url';
				if (isValidUuid(String(value))) return 'uuid';
				if (isValidDate(String(value))) return 'date';
				return value.length > 255 ? 'text' : 'string';
			
			case 'number':
				return 'number';
			
			case 'boolean':
				return 'boolean';
			
			case 'object':
				if (value instanceof Date) return 'datetime';
				return 'json';
			
			default:
				return 'string';
		}
	}

	/**
	 * Generate table schema from sample data
	 */
	static inferTableSchema(tableName: string, data: Record<string, FieldValue>[]): TableSchema {
		if (data.length === 0) {
			throw new Error('Cannot infer schema from empty data');
		}

		// Collect all field names
		const fieldNames = new Set<string>();
		data.forEach(row => {
			Object.keys(row).forEach(key => fieldNames.add(key));
		});

		// Analyze each field
		const fields: FieldSchema[] = Array.from(fieldNames).map(fieldName => {
			const values = data
				.map(row => row[fieldName])
				.filter(val => val !== null && val !== undefined);

			if (values.length === 0) {
				return {
					name: fieldName,
					type: 'string',
					nullable: true
				};
			}

			// Infer type from first non-null value
			const inferredType = this.inferFieldType(values[0]);
			
			// Check if field is nullable
			const nullable = data.some(row => row[fieldName] === null || row[fieldName] === undefined);

			// Check for potential primary key
			const isUnique = new Set(values).size === values.length;
			const couldBePrimaryKey = isUnique && !nullable && (inferredType === 'number' || inferredType === 'uuid');

			return {
				name: fieldName,
				type: inferredType,
				nullable,
				unique: isUnique,
				autoIncrement: couldBePrimaryKey && inferredType === 'number'
			};
		});

		// Try to identify primary key
		let primaryKey = fields.find(f => f.autoIncrement)?.name;
		if (!primaryKey) {
			primaryKey = fields.find(f => f.name.toLowerCase().includes('id') && f.unique)?.name;
		}
		if (!primaryKey) {
			primaryKey = fields.find(f => f.unique && !f.nullable)?.name;
		}

		return {
			name: tableName,
			fields,
			primaryKey: primaryKey ? [primaryKey] : [],
			indexes: [],
			relations: []
		};
	}

	/**
	 * Validate field value against schema
	 */
	static validateFieldValue(value: FieldValue, field: FieldSchema): boolean {
		// Check nullable
		if (value === null || value === undefined) {
			return field.nullable;
		}

		// Check type
		switch (field.type) {
			case 'string':
				return typeof value === 'string' && (!field.length || value.length <= field.length);
			
			case 'number':
				return typeof value === 'number';
			
			case 'boolean':
				return typeof value === 'boolean';
			
			case 'date':
			case 'datetime':
			case 'time':
				return value instanceof Date || isValidDate(String(value));
			
			case 'email':
				return typeof value === 'string' && isValidEmail(value);
			
			case 'url':
				return typeof value === 'string' && isValidUrl(value);
			
			case 'uuid':
				return typeof value === 'string' && isValidUuid(value);
			
			case 'json':
				return typeof value === 'object';
			
			case 'text':
				return typeof value === 'string';
			
			default:
				return true; // Unknown type, allow anything
		}
	}

	/**
	 * Get display name for field
	 */
	static getFieldDisplayName(field: FieldSchema): string {
		if (field.metadata?.displayName) {
			return field.metadata.displayName;
		}

		// Convert snake_case or camelCase to Title Case
		return field.name
			.replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase
			.replace(/_/g, ' ') // snake_case
			.replace(/\b\w/g, l => l.toUpperCase()); // Title Case
	}

	/**
	 * Check if field should be hidden in UI
	 */
	static isFieldHidden(field: FieldSchema): boolean {
		if (field.metadata?.hidden) return true;
		
		// Hide common system fields
		const systemFields = ['created_at', 'updated_at', 'deleted_at', 'password_hash'];
		return systemFields.includes(field.name.toLowerCase());
	}
}

/**
 * Data transformation utilities
 */
export class DataUtils {
	/**
	 * Convert database record to display format
	 */
	static formatRecordForDisplay(
		record: Record<string, FieldValue>, 
		schema: TableSchema
	): Record<string, string> {
		const formatted: Record<string, string> = {};

		for (const field of schema.fields) {
			const value = record[field.name];
			formatted[field.name] = this.formatFieldValue(value, field);
		}

		return formatted;
	}

	/**
	 * Format individual field value for display
	 */
	static formatFieldValue(value: FieldValue, field: FieldSchema): string {
		if (value === null || value === undefined) {
			return '';
		}

		switch (field.type) {
			case 'date':
				return value instanceof Date ? value.toLocaleDateString() : String(value);
			
			case 'datetime':
				return value instanceof Date ? value.toLocaleString() : String(value);
			
			case 'time':
				return value instanceof Date ? value.toLocaleTimeString() : String(value);
			
			case 'boolean':
				return value ? 'Yes' : 'No';
			
			case 'json':
				return typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
			
			case 'number':
				if (typeof value === 'number') {
					return field.precision ? value.toFixed(field.scale || 2) : value.toString();
				}
				return String(value);
			
			default:
				return String(value);
		}
	}

	/**
	 * Parse user input to appropriate field type
	 */
	static parseFieldValue(input: string, field: FieldSchema): FieldValue {
		if (!input.trim()) {
			return field.nullable ? null : undefined;
		}

		switch (field.type) {
			case 'number':
				const num = Number(input);
				return isNaN(num) ? undefined : num;
			
			case 'boolean':
				return ['true', 'yes', '1', 'on'].includes(input.toLowerCase());
			
			case 'date':
			case 'datetime':
				const date = new Date(input);
				return isNaN(date.getTime()) ? undefined : date;
			
			case 'json':
				try {
					return JSON.parse(input);
				} catch {
					return undefined;
				}
			
			default:
				return input;
		}
	}
}

// Helper validation functions
function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

function isValidUuid(uuid: string): boolean {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(uuid);
}

function isValidDate(dateString: string): boolean {
	const date = new Date(dateString);
	return !isNaN(date.getTime()) && date.toString() !== 'Invalid Date';
}