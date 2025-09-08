import { 
	PostgreSQLDataSource, 
	SchemaIntrospector, 
	CRUDFactory,
	type ConnectionConfig 
} from '@nexus/core';

/**
 * Example demonstrating real PostgreSQL integration with Nexus
 * This shows how to:
 * 1. Connect to a PostgreSQL database
 * 2. Introspect the schema
 * 3. Generate admin interface configuration
 * 4. Perform CRUD operations
 */
export async function demonstrateDatabaseIntegration() {
	console.log('🗄️  Starting PostgreSQL integration demo...');

	// Step 1: Create PostgreSQL data source
	const dataSource = new PostgreSQLDataSource(
		'postgres-demo',
		'Demo Database',
		{
			supportsTransactions: true,
			supportsJoins: true,
			supportsBulkOperations: true,
			maxConnections: 10,
			readOnlyMode: false,
			supportsIndexes: true,
			supportsViews: true,
			supportsForeignKeys: true
		}
	);

	// Step 2: Connection configuration
	const connectionConfig: ConnectionConfig = {
		host: process.env.DB_HOST || 'localhost',
		port: parseInt(process.env.DB_PORT || '5432'),
		database: process.env.DB_NAME || 'nexus_demo',
		user: process.env.DB_USER || 'postgres',
		password: process.env.DB_PASSWORD || 'password',
		ssl: process.env.NODE_ENV === 'production'
	};

	try {
		// Step 3: Connect to database
		console.log('📡 Connecting to PostgreSQL...');
		await dataSource.connect(connectionConfig);
		console.log('✅ Connected successfully!');

		// Step 4: Create demo tables if they don't exist
		await createDemoTables(dataSource);

		// Step 5: Introspect schema and generate admin config
		console.log('🔍 Introspecting database schema...');
		const introspector = new SchemaIntrospector(dataSource);
		const adminConfig = await introspector.discoverSchema();
		
		console.log(`📋 Discovered ${adminConfig.tables.length} tables:`);
		for (const table of adminConfig.tables) {
			console.log(`  - ${table.displayName} (${table.name})`);
			console.log(`    Fields: ${table.listFields.map(f => f.label).join(', ')}`);
			console.log(`    Search: ${table.searchFields.join(', ')}`);
		}

		// Step 6: Demonstrate CRUD operations
		const crudFactory = new CRUDFactory(dataSource);
		
		// Find the users table config
		const usersTable = adminConfig.tables.find(t => t.name === 'users');
		if (usersTable) {
			console.log('\n👥 Demonstrating CRUD operations on users table...');
			
			const usersCrud = crudFactory.create(usersTable);
			
			// Create a new user
			const newUser = await usersCrud.create({
				name: 'John Doe',
				email: 'john.doe@example.com',
				role: 'admin',
				active: true
			});
			console.log('✅ Created user:', newUser);
			
			// List users with pagination
			const usersList = await usersCrud.list({
				page: 1,
				limit: 10,
				search: 'john'
			});
			console.log(`📋 Found ${usersList.data.length} users (${usersList.pagination.total} total)`);
			
			// Update user
			if (newUser.id) {
				const updatedUser = await usersCrud.update(newUser.id, {
					role: 'moderator'
				});
				console.log('✅ Updated user:', updatedUser);
			}
			
			// Get field metadata for forms
			const fieldMetadata = usersCrud.getFieldMetadata();
			console.log('📝 Form fields:', fieldMetadata.map(f => `${f.label} (${f.type})`).join(', '));
		}

		// Step 7: Demonstrate relationship detection
		const postsTable = adminConfig.tables.find(t => t.name === 'posts');
		if (postsTable && postsTable.relationships.length > 0) {
			console.log('\n🔗 Detected relationships:');
			for (const rel of postsTable.relationships) {
				console.log(`  - ${rel.type}: ${rel.field} → ${rel.referencedTable}.${rel.displayField}`);
			}
		}

		// Step 8: Show generated UI configuration
		const usersUI = adminConfig.tables.find(t => t.name === 'users')?.ui;
		if (usersUI) {
			console.log('\n🎨 UI Configuration for users:');
			console.log(`  Icon: ${usersUI.icon}`);
			console.log(`  Color: ${usersUI.color}`);
			console.log(`  Default sort: ${usersUI.defaultSort.field} ${usersUI.defaultSort.direction}`);
			console.log(`  Items per page: ${usersUI.itemsPerPage}`);
		}

		console.log('\n🎉 Database integration demo completed successfully!');

	} catch (error) {
		console.error('❌ Database integration demo failed:', error);
		throw error;
	} finally {
		// Step 9: Clean up connection
		if (dataSource.isConnected()) {
			await dataSource.disconnect();
			console.log('🔌 Disconnected from database');
		}
	}
}

/**
 * Create demo tables for the integration example
 */
async function createDemoTables(dataSource: PostgreSQLDataSource) {
	console.log('📋 Setting up demo tables...');

	// Create users table
	try {
		await dataSource.createTable({
			name: 'users',
			fields: [
				{
					name: 'id',
					type: 'integer',
					nullable: false,
					primaryKey: true,
					autoIncrement: true
				},
				{
					name: 'name',
					type: 'string',
					length: 255,
					nullable: false
				},
				{
					name: 'email',
					type: 'string',
					length: 255,
					nullable: false,
					unique: true
				},
				{
					name: 'role',
					type: 'string',
					length: 50,
					nullable: false,
					defaultValue: 'user'
				},
				{
					name: 'active',
					type: 'boolean',
					nullable: false,
					defaultValue: true
				},
				{
					name: 'created_at',
					type: 'datetime',
					nullable: false
				},
				{
					name: 'updated_at',
					type: 'datetime',
					nullable: true
				}
			],
			indexes: [
				{
					name: 'users_email_idx',
					fields: ['email'],
					unique: true
				},
				{
					name: 'users_role_idx',
					fields: ['role'],
					unique: false
				}
			]
		});
		console.log('✅ Created users table');
	} catch (error) {
		if (error instanceof Error && error.message.includes('already exists')) {
			console.log('ℹ️  Users table already exists');
		} else {
			throw error;
		}
	}

	// Create posts table
	try {
		await dataSource.createTable({
			name: 'posts',
			fields: [
				{
					name: 'id',
					type: 'integer',
					nullable: false,
					primaryKey: true,
					autoIncrement: true
				},
				{
					name: 'title',
					type: 'string',
					length: 255,
					nullable: false
				},
				{
					name: 'content',
					type: 'text',
					nullable: true
				},
				{
					name: 'author_id',
					type: 'integer',
					nullable: false
				},
				{
					name: 'published',
					type: 'boolean',
					nullable: false,
					defaultValue: false
				},
				{
					name: 'created_at',
					type: 'datetime',
					nullable: false
				},
				{
					name: 'updated_at',
					type: 'datetime',
					nullable: true
				}
			],
			indexes: [
				{
					name: 'posts_author_idx',
					fields: ['author_id'],
					unique: false
				},
				{
					name: 'posts_published_idx',
					fields: ['published'],
					unique: false
				}
			]
		});
		console.log('✅ Created posts table');
	} catch (error) {
		if (error instanceof Error && error.message.includes('already exists')) {
			console.log('ℹ️  Posts table already exists');
		} else {
			throw error;
		}
	}

	// Insert sample data
	try {
		const usersCount = await dataSource.count('users');
		if (usersCount === 0) {
			await dataSource.create('users', {
				name: 'Admin User',
				email: 'admin@example.com',
				role: 'admin',
				active: true,
				created_at: new Date().toISOString()
			});

			await dataSource.create('users', {
				name: 'Jane Smith',
				email: 'jane@example.com',
				role: 'editor',
				active: true,
				created_at: new Date().toISOString()
			});

			console.log('✅ Inserted sample users');
		}

		const postsCount = await dataSource.count('posts');
		if (postsCount === 0) {
			await dataSource.create('posts', {
				title: 'Welcome to Nexus',
				content: 'This is a sample blog post created by the Nexus admin framework.',
				author_id: 1,
				published: true,
				created_at: new Date().toISOString()
			});

			console.log('✅ Inserted sample posts');
		}
	} catch (error) {
		console.warn('⚠️  Could not insert sample data:', error);
	}
}

// Export for use in package.json scripts
if (import.meta.url === `file://${process.argv[1]}`) {
	demonstrateDatabaseIntegration()
		.then(() => {
			console.log('✅ Demo completed successfully');
			process.exit(0);
		})
		.catch((error) => {
			console.error('❌ Demo failed:', error);
			process.exit(1);
		});
}