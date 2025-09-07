# @nexus/core

🚀 **The Database & Auth Agnostic Admin Framework**

Build powerful admin panels without vendor lock-in. Choose your own database, authentication, and UI components through a flexible plugin system.

## ✨ Core Philosophy

- **🛡️ Framework Agnostic** - Core never dictates your database or auth choices
- **🔌 Plugin-First** - Everything is extensible through adapters
- **🏗️ Zero Lock-in** - Switch providers without changing core code
- **⚡ Developer First** - Type-safe, fast, and intuitive APIs
- **🎯 Production Ready** - Built for scale from day one

## 🆚 Comparison with Alternatives

| Feature               | Nexus | Retool     | Forest Admin | React Admin |
| --------------------- | ----- | ---------- | ------------ | ----------- |
| **Database Agnostic** | ✅    | ⚠️ Limited | ⚠️ Limited   | ✅          |
| **Self Hosted**       | ✅    | ❌         | ❌           | ✅          |
| **Plugin System**     | ✅    | ⚠️ Limited | ❌           | ✅          |
| **Type Safety**       | ✅    | ❌         | ❌           | ⚠️ Partial  |
| **Auth Flexibility**  | ✅    | ⚠️ Limited | ⚠️ Limited   | ✅          |
| **Cost**              | Free  | $$$$       | $$$$         | Free        |

## 📦 Installation

```bash
npm install @nexus/core
```

## 🎯 Quick Start Examples

### Example 1: Enterprise Setup (PostgreSQL + Auth0)

```typescript
import { NexusKernel } from '@nexus/core';

const kernel = new NexusKernel({
 config: {
  app: {
   name: 'Enterprise Admin',
   version: '1.0.0',
   environment: 'production'
  }
 }
});

// Users install their chosen adapters
await kernel.registerPlugin(postgresAdapter);
await kernel.registerPlugin(auth0Adapter);
await kernel.bootstrap();
```

### Example 2: Startup Setup (MongoDB + Local Auth)

```typescript
const kernel = new NexusKernel();

// Different adapters, same core
await kernel.registerPlugin(mongoAdapter);
await kernel.registerPlugin(localAuthAdapter);
await kernel.bootstrap();
```

### Example 3: Headless API (SQLite + JWT)

```typescript
const kernel = new NexusKernel();

await kernel.registerPlugin(sqliteAdapter);
await kernel.registerPlugin(jwtAdapter);
await kernel.bootstrap();
```

## 🔌 Creating Data Source Adapters

```typescript
import type { NexusPlugin, DataSourceConfig } from '@nexus/core';

const postgresAdapter: NexusPlugin = {
 id: 'postgres-adapter',
 name: 'PostgreSQL Adapter',
 version: '1.0.0',
 hooks: {
  onLoad: async (context) => {
   const config: DataSourceConfig = {
    id: 'main-db',
    name: 'PostgreSQL Database',
    adapter: '@nexus/postgres-adapter',
    enabled: true,
    config: {
     host: process.env.DB_HOST,
     port: process.env.DB_PORT,
     database: process.env.DB_NAME
    },
    metadata: {
     capabilities: ['crud', 'transactions', 'joins']
    }
   };

   context.container.resolve('nexus:config').registerDataSource(config);
  }
 }
};
```

## 🔐 Creating Auth Adapters

```typescript
const auth0Adapter: NexusPlugin = {
 id: 'auth0-adapter',
 name: 'Auth0 Integration',
 version: '1.0.0',
 hooks: {
  onLoad: async (context) => {
   const config: AuthProviderConfig = {
    id: 'auth0-main',
    name: 'Auth0 SSO',
    adapter: '@nexus/auth0-adapter',
    enabled: true,
    priority: 100,
    config: {
     domain: process.env.AUTH0_DOMAIN,
     clientId: process.env.AUTH0_CLIENT_ID,
     audience: process.env.AUTH0_AUDIENCE
    },
    metadata: {
     features: ['sso', 'mfa', 'rbac']
    }
   };

   context.container.resolve('nexus:config').registerAuthProvider(config);
  }
 }
};
```

## 🏗️ Architecture Overview

Nexus follows the **Adapter Pattern** and **Inversion of Control** principles to achieve complete vendor neutrality:

```plaintext
┌─────────────────────────────────────────────────┐
│                 Nexus Core                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │   Kernel    │ │   Plugins   │ │   Config    ││
│  └─────────────┘ └─────────────┘ └─────────────┘│
└─────────────────────────────────────────────────┘
                           │
                  ┌────────┼────────┐
                  ▼        ▼        ▼
          ┌─────────────┬─────────────┬─────────────┐
          │   Data      │    Auth     │     UI      │
          │  Adapters   │  Adapters   │  Adapters   │
          └─────────────┴─────────────┴─────────────┘

PostgreSQL    Auth0        Material-UI
MongoDB       Okta         Tailwind CSS
MySQL         Local Auth   Custom Theme
REST APIs     SAML         Chart.js
GraphQL       LDAP         etc...
```

### Core Components

#### 🧠 **Nexus Kernel**

- Central orchestrator for all systems
- Plugin lifecycle management
- Dependency injection container
- Event-driven communication

#### 🔌 **Adapter Registry**

- **Data Adapters**: `@nexus/postgres`, `@nexus/mongodb`, `@nexus/rest-api`
- **Auth Adapters**: `@nexus/auth0`, `@nexus/local-auth`, `@nexus/okta`
- **UI Adapters**: `@nexus/material-ui`, `@nexus/tailwind`, `@nexus/charts`

#### ⚙️ **Configuration Management**

```typescript
// Users configure through simple JSON
{
  "plugins": {
    "registry": {
      "dataSources": {
        "main": {
          "adapter": "@nexus/postgres-adapter",
          "config": { /* PostgreSQL specific */ }
        }
      },
      "authProviders": {
        "sso": {
          "adapter": "@nexus/auth0-adapter",
          "config": { /* Auth0 specific */ }
        }
      }
    }
  }
}
```

## 🎯 Benefits Over Competitors

### 🆚 **vs Retool/Forest Admin**

- ✅ **No Vendor Lock-in**: Your data stays yours
- ✅ **Cost Effective**: No per-user pricing
- ✅ **Full Customization**: Not limited to their UI components
- ✅ **Self Hosted**: Complete control over deployment

### 🆚 **vs React Admin**

- ✅ **Better DX**: Built-in TypeScript support
- ✅ **Modern Stack**: Uses latest web standards
- ✅ **Plugin Ecosystem**: More extensible architecture
- ✅ **Performance**: Optimized for large datasets

## 📚 API Reference

### Core Classes

```typescript
// Main kernel
class NexusKernel {
 constructor(options?: NexusKernelOptions);
 bootstrap(): Promise<void>;
 registerPlugin(plugin: NexusPlugin): Promise<void>;
 getContainer(): DIContainer;
 getConfiguration(): NexusConfig;
}

// Configuration manager
class ConfigManager {
 registerDataSource(config: DataSourceConfig): void;
 registerAuthProvider(config: AuthProviderConfig): void;
 getEnabledDataSources(): DataSourceConfig[];
 getEnabledAuthProviders(): AuthProviderConfig[];
}

// Dependency injection
class DIContainer {
 registerSingleton<T>(token: string, service: T): void;
 resolve<T>(token: string): T;
}
```

### Plugin Interface

```typescript
interface NexusPlugin {
 id: string;
 name: string;
 version: string;
 hooks: {
  onLoad?(context: PluginContext): Promise<void>;
  onInit?(context: PluginContext): Promise<void>;
  onDestroy?(context: PluginContext): Promise<void>;
 };
}
```

## 🚀 Next Steps

1. **Install Core**: `npm install @nexus/core`
2. **Choose Adapters**: Install database and auth adapters you need
3. **Configure**: Set up your adapters via plugins
4. **Build**: Create your admin interface
5. **Deploy**: Host anywhere you want

## 📖 Ecosystem Packages (Coming Soon)

- `@nexus/postgres-adapter` - PostgreSQL data source
- `@nexus/auth0-adapter` - Auth0 authentication
- `@nexus/mongodb-adapter` - MongoDB data source
- `@nexus/material-ui` - Material-UI components
- `@nexus/crud-generator` - Auto-generate CRUD interfaces

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

MIT - see [LICENSE](./LICENSE) file for details.
