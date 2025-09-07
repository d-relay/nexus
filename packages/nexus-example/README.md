# @nexus/example

Example applications demonstrating the Nexus admin framework with different technology stacks.

## 📁 Examples

### 🏢 Enterprise Setup

```bash
npm run example:enterprise
```

- PostgreSQL for structured data
- Auth0 for enterprise SSO
- Production-ready security settings
- Role-based access control

### 🚀 Startup Setup

```bash
npm run example:startup
```

- MongoDB for flexible schemas
- Local authentication
- Quick development setup
- Minimal configuration

### 🎯 Full Demo

```bash
npm run example:all
```

Demonstrates multiple scenarios:

- Enterprise with PostgreSQL + Auth0
- Startup with MongoDB + Local Auth
- Multi-tenant SaaS with multiple databases

## 🏃 Quick Start

1. Install dependencies:

```bash
npm install
```

2. Set environment variables (optional):

```bash
# For PostgreSQL
DB_HOST=localhost
DB_NAME=nexus_demo
DB_USER=postgres
DB_PASSWORD=password

# For MongoDB
MONGODB_URL=mongodb://localhost:27017/nexus_demo

# For Auth0
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
```

3. Run examples:

```bash
# Run all demos
npm run example:all

# Run specific scenario
npm run example:enterprise
npm run example:startup
```

## 🔧 Creating Your Own Setup

```typescript
import { NexusKernel } from '@nexus/core';

// 1. Create kernel with your config
const kernel = new NexusKernel({
	config: {
		app: {
			name: 'My Admin Panel',
			version: '1.0.0'
		}
	}
});

// 2. Add your chosen adapters
await kernel.registerPlugin(yourDatabaseAdapter);
await kernel.registerPlugin(yourAuthAdapter);

// 3. Bootstrap
await kernel.bootstrap();
```

## 📚 Available Adapters

### Database Adapters

- `@nexus/postgres-adapter` - PostgreSQL
- `@nexus/mongodb-adapter` - MongoDB
- `@nexus/mysql-adapter` - MySQL
- `@nexus/sqlite-adapter` - SQLite

### Auth Adapters

- `@nexus/auth0-adapter` - Auth0 SSO
- `@nexus/okta-adapter` - Okta SSO
- `@nexus/local-auth-adapter` - Email/Password
- `@nexus/jwt-adapter` - JWT tokens

### UI Adapters

- `@nexus/material-ui` - Material Design
- `@nexus/tailwind-ui` - Tailwind CSS
- `@nexus/chakra-ui` - Chakra UI

## 💡 Key Concepts

The examples demonstrate:

1. **Database Agnostic**: Choose any database
2. **Auth Flexibility**: Use any authentication provider
3. **Plugin Architecture**: Extend with custom plugins
4. **Type Safety**: Full TypeScript support
5. **Configuration**: Environment-based config

## 📖 Learn More

- [Nexus Core Documentation](../nexus-core/README.md)
- [Creating Plugins Guide](../nexus-core/docs/plugins.md)
- [API Reference](../nexus-core/docs/api.md)
