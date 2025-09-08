/**
 * Nexus Database Layer - Simple Drizzle ORM Integration
 */

// Main database functionality
export {
	createDatabase,
	DatabaseManager,
	databaseManager,
	type DatabaseDriver,
	type DatabaseConfig
} from './drizzle-adapter';

// Re-export commonly used Drizzle utilities
export type {
	InferInsertModel,
	InferSelectModel
} from 'drizzle-orm';

// Schema helpers
export {
	relations,
	sql
} from 'drizzle-orm';

// Common column types from SQLite core (work as base types)
export {
	text,
	integer
} from 'drizzle-orm/sqlite-core';

// PostgreSQL specific exports (when using PostgreSQL)
export {
	pgTable,
	serial,
	varchar,
	uuid,
	jsonb,
	boolean,
	timestamp
} from 'drizzle-orm/pg-core';

// MySQL specific exports (when using MySQL)
export {
	mysqlTable,
	int,
	varchar as mysqlVarchar
} from 'drizzle-orm/mysql-core';

// SQLite specific exports (when using SQLite)
export {
	sqliteTable,
	text as sqliteText,
	integer as sqliteInteger
} from 'drizzle-orm/sqlite-core';