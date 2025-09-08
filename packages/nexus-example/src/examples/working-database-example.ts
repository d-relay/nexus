/**
 * Working Database Example with PostgreSQL and Drizzle ORM
 * Shows how to use Nexus with real database operations
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, sql } from 'drizzle-orm';
import { pgTable, serial, varchar, boolean, timestamp, text } from 'drizzle-orm/pg-core';
import { Pool } from 'pg';

// Define schema using Drizzle
export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	role: varchar('role', { length: 50 }).default('user'),
	active: boolean('active').default(true),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const posts = pgTable('posts', {
	id: serial('id').primaryKey(),
	title: varchar('title', { length: 255 }).notNull(),
	content: text('content'),
	authorId: serial('author_id').references(() => users.id),
	published: boolean('published').default(false),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

// Type inference from schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

/**
 * Working database example with real PostgreSQL operations
 */
export async function workingDatabaseExample() {
	console.log('🗄️  Starting Working Database Example...');

	// Database connection
	const pool = new Pool({
		connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/nexus_example',
	});

	const db = drizzle(pool);

	try {
		// Test connection
		console.log('📡 Testing database connection...');
		await pool.query('SELECT NOW()');
		console.log('✅ Database connection successful!');

		// Create tables (if they don't exist)
		console.log('🔧 Creating tables...');
		await db.execute(sql`
			CREATE TABLE IF NOT EXISTS users (
				id SERIAL PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				email VARCHAR(255) NOT NULL UNIQUE,
				role VARCHAR(50) DEFAULT 'user',
				active BOOLEAN DEFAULT true,
				created_at TIMESTAMP DEFAULT NOW(),
				updated_at TIMESTAMP DEFAULT NOW()
			)
		`);

		await db.execute(sql`
			CREATE TABLE IF NOT EXISTS posts (
				id SERIAL PRIMARY KEY,
				title VARCHAR(255) NOT NULL,
				content TEXT,
				author_id INTEGER REFERENCES users(id),
				published BOOLEAN DEFAULT false,
				created_at TIMESTAMP DEFAULT NOW(),
				updated_at TIMESTAMP DEFAULT NOW()
			)
		`);

		console.log('✅ Tables created successfully!');

		// Clean up existing data
		console.log('🧹 Cleaning up existing data...');
		await db.delete(posts);
		await db.delete(users);

		// Insert sample users
		console.log('👥 Creating sample users...');
		const sampleUsers: NewUser[] = [
			{
				name: 'John Doe',
				email: 'john@example.com',
				role: 'admin'
			},
			{
				name: 'Jane Smith', 
				email: 'jane@example.com',
				role: 'editor'
			},
			{
				name: 'Bob Johnson',
				email: 'bob@example.com',
				role: 'user'
			}
		];

		const insertedUsers = await db.insert(users).values(sampleUsers).returning();
		console.log(`✅ Created ${insertedUsers.length} users:`, insertedUsers.map(u => `${u.name} (${u.role})`));

		// Insert sample posts
		console.log('📝 Creating sample posts...');
		const samplePosts: NewPost[] = [
			{
				title: 'Getting Started with Nexus',
				content: 'Welcome to Nexus! This is your first blog post using our amazing admin framework.',
				authorId: insertedUsers[0].id,
				published: true
			},
			{
				title: 'Database Operations Made Easy',
				content: 'Learn how to perform database operations with Drizzle ORM in Nexus.',
				authorId: insertedUsers[1].id,
				published: true
			},
			{
				title: 'Advanced Features',
				content: 'Explore advanced features like relationships, transactions, and more.',
				authorId: insertedUsers[0].id,
				published: false
			},
			{
				title: 'User Management',
				content: 'How to manage users and roles in your Nexus application.',
				authorId: insertedUsers[1].id,
				published: true
			}
		];

		const insertedPosts = await db.insert(posts).values(samplePosts).returning();
		console.log(`✅ Created ${insertedPosts.length} posts`);

		// Query operations
		console.log('\n🔍 Performing database queries...');

		// Find all active users
		const activeUsers = await db
			.select()
			.from(users)
			.where(eq(users.active, true));
		
		console.log(`📋 Found ${activeUsers.length} active users:`, 
			activeUsers.map(u => `${u.name} <${u.email}> (${u.role})`));

		// Find published posts with author information
		const publishedPostsWithAuthors = await db
			.select({
				postId: posts.id,
				title: posts.title,
				content: posts.content,
				published: posts.published,
				createdAt: posts.createdAt,
				authorName: users.name,
				authorEmail: users.email,
				authorRole: users.role
			})
			.from(posts)
			.leftJoin(users, eq(posts.authorId, users.id))
			.where(eq(posts.published, true));

		console.log(`📚 Published posts with authors:`);
		publishedPostsWithAuthors.forEach(post => {
			console.log(`  - "${post.title}" by ${post.authorName} (${post.authorRole})`);
		});

		// Count posts by user
		const postCountsByUser = await db
			.select({
				userId: users.id,
				userName: users.name,
				userRole: users.role,
				postCount: sql<number>`COUNT(${posts.id})`
			})
			.from(users)
			.leftJoin(posts, eq(users.id, posts.authorId))
			.groupBy(users.id)
			.orderBy(users.name);

		console.log(`📊 Post counts by user:`);
		postCountsByUser.forEach(stat => {
			console.log(`  - ${stat.userName} (${stat.userRole}): ${stat.postCount} posts`);
		});

		// Update operations
		console.log('\n✏️  Performing update operations...');

		// Update user role
		const updatedUser = await db
			.update(users)
			.set({ 
				role: 'super-admin',
				updatedAt: new Date()
			})
			.where(eq(users.email, 'john@example.com'))
			.returning();

		console.log(`✅ Updated user: ${updatedUser[0]?.name} is now ${updatedUser[0]?.role}`);

		// Publish a draft post
		const publishedPost = await db
			.update(posts)
			.set({ 
				published: true,
				updatedAt: new Date()
			})
			.where(eq(posts.title, 'Advanced Features'))
			.returning();

		console.log(`✅ Published post: "${publishedPost[0]?.title}"`);

		// Complex aggregation query
		console.log('\n📈 Complex aggregation queries...');
		
		const userStats = await db
			.select({
				totalUsers: sql<number>`COUNT(DISTINCT ${users.id})`,
				totalPosts: sql<number>`COUNT(${posts.id})`,
				publishedPosts: sql<number>`COUNT(CASE WHEN ${posts.published} = true THEN 1 END)`,
				draftPosts: sql<number>`COUNT(CASE WHEN ${posts.published} = false THEN 1 END)`
			})
			.from(users)
			.leftJoin(posts, eq(users.id, posts.authorId));

		console.log('📊 Database Statistics:');
		console.log(`  - Total Users: ${userStats[0]?.totalUsers}`);
		console.log(`  - Total Posts: ${userStats[0]?.totalPosts}`);
		console.log(`  - Published Posts: ${userStats[0]?.publishedPosts}`);
		console.log(`  - Draft Posts: ${userStats[0]?.draftPosts}`);

		// Transaction example
		console.log('\n💸 Transaction example...');
		
		await db.transaction(async (tx) => {
			// Create a new user and their first post in a transaction
			const newUser = await tx.insert(users).values({
				name: 'Alice Cooper',
				email: 'alice@example.com',
				role: 'author'
			}).returning();

			const newPost = await tx.insert(posts).values({
				title: 'My First Post',
				content: 'This is my very first blog post!',
				authorId: newUser[0].id,
				published: true
			}).returning();

			console.log(`✅ Transaction completed: Created user "${newUser[0].name}" and post "${newPost[0].title}"`);
		});

		// Final query to show all data
		console.log('\n📋 Final data summary...');
		const finalUserCount = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
		const finalPostCount = await db.select({ count: sql<number>`COUNT(*)` }).from(posts);
		
		console.log(`📊 Final counts: ${finalUserCount[0]?.count} users, ${finalPostCount[0]?.count} posts`);

		console.log('\n🎉 Working Database Example completed successfully!');

	} catch (error) {
		console.error('❌ Database example failed:', error);
		throw error;
	} finally {
		// Clean up connection
		await pool.end();
		console.log('🔌 Database connection closed');
	}
}

// Export schema for reuse
export const schema = { users, posts };

// Run example if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	workingDatabaseExample()
		.then(() => {
			console.log('✅ Example completed successfully');
			process.exit(0);
		})
		.catch((error) => {
			console.error('❌ Example failed:', error);
			process.exit(1);
		});
}