<script lang="ts">
	import { onMount } from 'svelte';
	import { initializeNexus } from '$lib/nexus';
	import { kernel } from '$lib/nexus';

	let loading = true;
	let pluginData: any[] = [];

	onMount(async () => {
		await initializeNexus();
		const config = kernel.getConfiguration();
		
		// Mock plugin data for demo
		pluginData = [
			{
				id: 'postgres',
				name: 'PostgreSQL Database',
				version: '1.0.0',
				status: 'active',
				type: 'database',
				description: 'Production-grade PostgreSQL integration with ACID compliance'
			},
			{
				id: 'auth0',
				name: 'Auth0 Authentication',
				version: '1.0.0',
				status: 'active',
				type: 'auth',
				description: 'Enterprise SSO with multi-factor authentication'
			},
			{
				id: 'mock-data',
				name: 'Mock Data Provider',
				version: '1.0.0',
				status: 'active',
				type: 'utility',
				description: 'Provides sample data for development and testing'
			}
		];
		
		loading = false;
	});
</script>

<svelte:head>
	<title>Plugins - Nexus Admin</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">🔌 Plugin Management</h1>
		<p class="text-gray-600 mt-2">Manage your installed plugins and adapters</p>
	</div>

	{#if loading}
		<div class="animate-pulse space-y-4">
			{#each Array(3) as _}
				<div class="bg-gray-200 h-32 rounded-lg"></div>
			{/each}
		</div>
	{:else}
		<div class="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
			<div class="px-4 py-5 sm:px-6 flex justify-between items-center">
				<div>
					<h3 class="text-lg leading-6 font-medium text-gray-900">Installed Plugins</h3>
					<p class="mt-1 max-w-2xl text-sm text-gray-500">{pluginData.length} plugins currently installed</p>
				</div>
				<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
					Install Plugin
				</button>
			</div>
			
			<div class="border-t border-gray-200">
				<div class="divide-y divide-gray-200">
					{#each pluginData as plugin}
						<div class="px-4 py-6 sm:px-6">
							<div class="flex items-center justify-between">
								<div class="flex items-center">
									<div class="flex-shrink-0 h-12 w-12">
										<div class="h-12 w-12 rounded-lg flex items-center justify-center
											{plugin.type === 'database' ? 'bg-green-100' : 
											 plugin.type === 'auth' ? 'bg-blue-100' : 
											 'bg-gray-100'}">
											<span class="text-xl">
												{plugin.type === 'database' ? '🗄️' : 
												 plugin.type === 'auth' ? '🔐' : 
												 '⚙️'}
											</span>
										</div>
									</div>
									<div class="ml-4">
										<div class="flex items-center">
											<h4 class="text-lg font-medium text-gray-900">{plugin.name}</h4>
											<span class="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
												{plugin.status}
											</span>
										</div>
										<p class="text-sm text-gray-500">{plugin.description}</p>
										<div class="mt-2 flex items-center text-sm text-gray-400">
											<span>ID: {plugin.id}</span>
											<span class="mx-2">•</span>
											<span>Version {plugin.version}</span>
											<span class="mx-2">•</span>
											<span class="capitalize">{plugin.type} Plugin</span>
										</div>
									</div>
								</div>
								<div class="flex items-center space-x-2">
									<button class="text-blue-600 hover:text-blue-900 font-medium">Configure</button>
									<button class="text-gray-600 hover:text-gray-900 font-medium">Disable</button>
									<button class="text-red-600 hover:text-red-900 font-medium">Remove</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Plugin Categories -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center mb-4">
					<div class="bg-green-100 p-3 rounded-lg">
						<span class="text-2xl">🗄️</span>
					</div>
					<h3 class="ml-3 text-lg font-semibold">Database Adapters</h3>
				</div>
				<p class="text-gray-600 text-sm mb-4">Connect to any database system</p>
				<ul class="text-sm text-gray-500 space-y-1">
					<li>• PostgreSQL</li>
					<li>• MongoDB</li>
					<li>• MySQL</li>
					<li>• SQLite</li>
					<li>• Redis</li>
				</ul>
			</div>

			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center mb-4">
					<div class="bg-blue-100 p-3 rounded-lg">
						<span class="text-2xl">🔐</span>
					</div>
					<h3 class="ml-3 text-lg font-semibold">Auth Providers</h3>
				</div>
				<p class="text-gray-600 text-sm mb-4">Integrate authentication services</p>
				<ul class="text-sm text-gray-500 space-y-1">
					<li>• Auth0</li>
					<li>• Okta</li>
					<li>• Firebase Auth</li>
					<li>• AWS Cognito</li>
					<li>• Local Auth</li>
				</ul>
			</div>

			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center mb-4">
					<div class="bg-purple-100 p-3 rounded-lg">
						<span class="text-2xl">🎨</span>
					</div>
					<h3 class="ml-3 text-lg font-semibold">UI Components</h3>
				</div>
				<p class="text-gray-600 text-sm mb-4">Customize your interface</p>
				<ul class="text-sm text-gray-500 space-y-1">
					<li>• Material-UI</li>
					<li>• Tailwind CSS</li>
					<li>• Ant Design</li>
					<li>• Chart.js</li>
					<li>• Custom Themes</li>
				</ul>
			</div>
		</div>

		<!-- Instructions -->
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
			<h3 class="text-lg font-semibold text-blue-900 mb-2">🚀 How to Add Plugins</h3>
			<p class="text-blue-800 mb-4">
				Nexus uses a plugin-based architecture. You can easily add new functionality by installing plugins:
			</p>
			<div class="bg-white rounded p-4 font-mono text-sm">
				<div class="text-gray-600"># Install a database adapter</div>
				<div>npm install @nexus/postgres-adapter</div>
				<br>
				<div class="text-gray-600"># Install an auth provider</div>
				<div>npm install @nexus/auth0-adapter</div>
				<br>
				<div class="text-gray-600"># Register in your code</div>
				<div>await kernel.registerPlugin(postgresAdapter);</div>
			</div>
		</div>
	{/if}
</div>