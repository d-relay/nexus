/**
 * Schema Synchronization Example
 * Shows how to generate Drizzle schemas from existing PostgreSQL database
 */

import { generateSchemaFromDatabase, createSchemaIntrospector } from '@nexus/core';
import path from 'path';
import fs from 'fs/promises';

/**
 * Example: Generate schema from existing database
 */
export async function schemaSyncExample() {
	console.log('🔄 Starting Schema Synchronization Example...');

	const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/nexus_example';
	const outputPath = path.join(process.cwd(), 'src/generated/schema.ts');

	try {
		// Method 1: Quick generate
		console.log('📋 Method 1: Quick schema generation...');
		await generateSchemaFromDatabase(databaseUrl, outputPath);

		// Method 2: Detailed introspection
		console.log('\n🔍 Method 2: Detailed introspection...');
		const introspector = createSchemaIntrospector({
			databaseUrl,
			outputPath: path.join(process.cwd(), 'src/generated/detailed-schema.ts'),
			driver: 'pg',
			schemaName: 'public',
			includeViews: false,
			includeFunctions: false
		});

		// Get database info
		const tables = await introspector.introspectDatabase();
		
		console.log(`📊 Database introspection results:`);
		console.log(`   - Found ${tables.length} tables`);
		
		for (const table of tables) {
			console.log(`\n   📋 Table: ${table.name}`);
			console.log(`      - Columns: ${table.columns.length}`);
			console.log(`      - Primary Keys: ${table.primaryKeys.join(', ') || 'none'}`);
			console.log(`      - Foreign Keys: ${table.foreignKeys.length}`);
			console.log(`      - Indexes: ${table.indexes.length}`);
			
			// Show column details
			table.columns.forEach(col => {
				const constraints = [];
				if (!col.nullable) constraints.push('NOT NULL');
				if (col.autoIncrement) constraints.push('AUTO_INCREMENT');
				if (col.default) constraints.push(`DEFAULT: ${col.default}`);
				
				console.log(`         - ${col.name}: ${col.type}${col.length ? `(${col.length})` : ''} ${constraints.join(', ')}`);
			});

			// Show foreign keys
			if (table.foreignKeys.length > 0) {
				console.log('      Foreign Keys:');
				table.foreignKeys.forEach(fk => {
					console.log(`         - ${fk.columnName} → ${fk.referencedTable}.${fk.referencedColumn}`);
				});
			}

			// Show indexes
			if (table.indexes.length > 0) {
				console.log('      Indexes:');
				table.indexes.forEach(idx => {
					console.log(`         - ${idx.name} (${idx.columns.join(', ')}) ${idx.unique ? 'UNIQUE' : ''}`);
				});
			}
		}

		// Generate the schema file
		await introspector.saveSchemaToFile();

		// Show generated schema content
		console.log('\n📄 Generated schema preview:');
		const generatedSchema = await fs.readFile(outputPath, 'utf8');
		console.log('─'.repeat(80));
		console.log(generatedSchema.split('\n').slice(0, 20).join('\n'));
		if (generatedSchema.split('\n').length > 20) {
			console.log('... (truncated)');
		}
		console.log('─'.repeat(80));

		console.log('\n✅ Schema synchronization completed successfully!');
		console.log(`📁 Generated files:`);
		console.log(`   - ${outputPath}`);
		console.log(`   - ${path.join(process.cwd(), 'src/generated/detailed-schema.ts')}`);

	} catch (error) {
		console.error('❌ Schema sync failed:', error);
		
		if (error instanceof Error) {
			if (error.message.includes('connect ECONNREFUSED')) {
				console.log('\n💡 Tip: Make sure PostgreSQL is running and accessible at:');
				console.log(`   ${databaseUrl}`);
				console.log('\n   To start PostgreSQL with Docker:');
				console.log('   docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:15');
			} else if (error.message.includes('database') && error.message.includes('does not exist')) {
				console.log('\n💡 Tip: Create the database first:');
				console.log('   psql -c "CREATE DATABASE nexus_example;"');
			}
		}
		
		throw error;
	}
}

/**
 * Example: Compare schemas (useful for detecting changes)
 */
export async function compareSchemas() {
	console.log('🔄 Schema comparison example...');
	
	// This would compare current database schema with saved schema file
	// Useful for detecting if database structure changed
	
	console.log('💡 Schema comparison functionality can be implemented to:');
	console.log('   - Detect new/dropped tables');
	console.log('   - Detect column changes');
	console.log('   - Detect index changes');
	console.log('   - Generate diff reports');
	console.log('   - Alert on breaking changes');
}

/**
 * Example: Continuous schema monitoring
 */
export async function monitorSchema() {
	console.log('👀 Schema monitoring example...');
	
	console.log('💡 Schema monitoring can include:');
	console.log('   - Periodic schema snapshots');
	console.log('   - Automated schema regeneration');
	console.log('   - Integration with CI/CD pipelines');
	console.log('   - Slack/email notifications on changes');
}

// Run example if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	schemaSyncExample()
		.then(() => {
			console.log('✅ Schema sync example completed successfully');
			process.exit(0);
		})
		.catch((error) => {
			console.error('❌ Schema sync example failed:', error);
			process.exit(1);
		});
}