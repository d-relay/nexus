/**
 * Simple Drizzle ORM demonstration with Nexus
 * Shows how easy it is to work with databases using Drizzle directly
 */

// import { 
// 	databaseManager, 
// 	pgTable, 
// 	serial, 
// 	varchar, 
// 	boolean, 
// 	timestamp,
// 	type InferInsertModel,
// 	type InferSelectModel
// } from '@nexus/core';
import { eq, sql, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { boolean, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

// Define schema using Drizzle
export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	active: boolean('active').default(true),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const posts = pgTable('posts', {
	id: serial('id').primaryKey(),
	title: varchar('title', { length: 255 }).notNull(),
	content: varchar('content', { length: 1000 }),
	authorId: serial('author_id').references(() => users.id),
	published: boolean('published').default(false),
	createdAt: timestamp('created_at').defaultNow()
});

// Type inference from schema
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;

/**
 * Demonstrate simple database operations with Drizzle
 */
export async function simpleDrizzleDemo() {
	console.log('🚀 Starting Simple Drizzle Demo...');

	try {
		// Connect to database
		console.log('📡 Connecting to database...');
		const db = await databaseManager.connect('demo', {
			driver: 'pg',
			connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/nexus_demo',
			schema: { users, posts }
		});

		console.log('✅ Connected successfully!');

		// Create users
		console.log('👥 Creating users...');
		const newUsers: NewUser[] = [
			{ name: 'Alice Johnson', email: 'alice@example.com' },
			{ name: 'Bob Smith', email: 'bob@example.com' },
			{ name: 'Carol Davis', email: 'carol@example.com' }
		];

		const createdUsers = await db.insert(users).values(newUsers).returning();
		console.log(`✅ Created ${createdUsers.length} users:`, createdUsers.map(u => u.name));

		// Query users
		console.log('🔍 Querying all active users...');
		const activeUsers = await db
			.select()
			.from(users)
			.where(eq(users.active, true));

		console.log(`📋 Found ${activeUsers.length} active users:`, activeUsers.map(u => `${u.name} (${u.email})`));

		// Create posts
		console.log('📝 Creating posts...');
		const newPosts: NewPost[] = [
			{
				title: 'Welcome to Nexus',
				content: 'This is our first blog post using Nexus with Drizzle ORM!',
				authorId: createdUsers[0].id,
				published: true
			},
			{
				title: 'Why Drizzle is Awesome',
				content: 'Type-safe queries, great performance, and simple API.',
				authorId: createdUsers[1].id,
				published: true
			},
			{
				title: 'Draft Post',
				content: 'This is still a draft...',
				authorId: createdUsers[2].id,
				published: false
			}
		];

		const createdPosts = await db.insert(posts).values(newPosts).returning();
		console.log(`✅ Created ${createdPosts.length} posts`);

		// Complex query with joins
		console.log('🔗 Performing join query...');
		const postsWithAuthors = await db
			.select({
				id: posts.id,
				title: posts.title,
				published: posts.published,
				authorName: users.name,
				authorEmail: users.email
			})
			.from(posts)
			.leftJoin(users, eq(posts.authorId, users.id))
			.where(eq(posts.published, true));

		console.log('📚 Published posts with authors:');
		postsWithAuthors.forEach(post => {
			console.log(`  - "${post.title}" by ${post.authorName} (${post.authorEmail})`);
		});

		// Update user
		console.log('✏️  Updating user...');
		const updatedUser = await db
			.update(users)
			.set({ name: 'Alice Johnson-Smith' })
			.where(eq(users.email, 'alice@example.com'))
			.returning();

		console.log(`✅ Updated user: ${updatedUser[0]?.name}`);

		// Count posts by user
		console.log('📊 Counting posts by user...');
		const postCounts = await db
			.select({
				authorName: users.name,
				postCount: sql<number>`count(${posts.id})`
			})
			.from(users)
			.leftJoin(posts, eq(users.id, posts.authorId))
			.groupBy(users.id);

		console.log('📈 Post counts:');
		postCounts.forEach(count => {
			console.log(`  - ${count.authorName}: ${count.postCount} posts`);
		});

		// Clean up
		console.log('🧹 Cleaning up...');
		await db.delete(posts);
		await db.delete(users);
		console.log('✅ Cleanup completed');

		console.log('🎉 Simple Drizzle Demo completed successfully!');

	} catch (error) {
		console.error('❌ Demo failed:', error);
		throw error;
	} finally {
		// Disconnect
		await databaseManager.disconnect('demo');
		console.log('🔌 Disconnected from database');
	}
}

// Run demo if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	simpleDrizzleDemo()
		.then(() => {
			console.log('✅ Demo completed successfully');
			process.exit(0);
		})
		.catch((error) => {
			console.error('❌ Demo failed:', error);
			process.exit(1);
		});
}