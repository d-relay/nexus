<script lang="ts">
	import { onMount } from 'svelte';
	import { initializeNexus, getNexusData } from '$lib/nexus';

	let nexusData: any = {};
	let loading = true;
	let error = '';

	onMount(async () => {
		try {
			await initializeNexus();
			nexusData = getNexusData();
		} catch (err) {
			error = `Error: ${err}`;
			console.error('Failed to initialize Nexus:', err);
		} finally {
			loading = false;
		}
	});
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<div class="text-center mb-12">
		<h1 class="text-4xl font-bold text-gray-900 mb-4">
			🚀 Nexus Admin Framework
		</h1>
		<p class="text-xl text-gray-600 max-w-2xl mx-auto">
			Database & Auth agnostic admin framework built with SvelteKit
		</p>
	</div>

	{#if loading}
		<div class="text-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
			<p class="text-gray-600 mt-4">Initializing Nexus kernel...</p>
		</div>
	{:else if error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
			{error}
		</div>
	{:else}
		<!-- Hero Section -->
		<div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8 mb-8">
			<div class="grid md:grid-cols-2 gap-8 items-center">
				<div>
					<h2 class="text-2xl font-bold mb-4">
						{nexusData.config?.app?.name || 'Nexus Admin'}
					</h2>
					<p class="text-blue-100 mb-6">
						Version {nexusData.config?.app?.version || '1.0.0'} • 
						{nexusData.config?.app?.environment || 'development'}
					</p>
					<div class="flex gap-4">
						<a href="/dashboard" class="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
							View Dashboard
						</a>
						<a href="/plugins" class="border border-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
							Manage Plugins
						</a>
					</div>
				</div>
				<div class="space-y-4">
					<div class="bg-white bg-opacity-20 rounded-lg p-4">
						<h3 class="font-semibold mb-2">🗄️ Data Sources</h3>
						<p class="text-blue-100">{nexusData.dataSources?.length || 0} configured</p>
					</div>
					<div class="bg-white bg-opacity-20 rounded-lg p-4">
						<h3 class="font-semibold mb-2">🔐 Auth Providers</h3>
						<p class="text-blue-100">{nexusData.authProviders?.length || 0} configured</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Features Grid -->
		<div class="grid md:grid-cols-3 gap-6 mb-8">
			<div class="bg-white rounded-lg p-6 shadow-md">
				<div class="flex items-center mb-4">
					<div class="bg-blue-100 p-3 rounded-lg">
						<span class="text-2xl">🔌</span>
					</div>
					<h3 class="ml-4 text-lg font-semibold">Plugin Architecture</h3>
				</div>
				<p class="text-gray-600">
					Extensible plugin system allows you to add any database, authentication provider, or UI component.
				</p>
			</div>

			<div class="bg-white rounded-lg p-6 shadow-md">
				<div class="flex items-center mb-4">
					<div class="bg-green-100 p-3 rounded-lg">
						<span class="text-2xl">🗄️</span>
					</div>
					<h3 class="ml-4 text-lg font-semibold">Database Agnostic</h3>
				</div>
				<p class="text-gray-600">
					Choose PostgreSQL, MongoDB, MySQL, or any database. No vendor lock-in, ever.
				</p>
			</div>

			<div class="bg-white rounded-lg p-6 shadow-md">
				<div class="flex items-center mb-4">
					<div class="bg-purple-100 p-3 rounded-lg">
						<span class="text-2xl">🔐</span>
					</div>
					<h3 class="ml-4 text-lg font-semibold">Auth Flexible</h3>
				</div>
				<p class="text-gray-600">
					Integrate with Auth0, Okta, Firebase, or build custom authentication. Your choice.
				</p>
			</div>
		</div>

		<!-- Quick Stats -->
		<div class="bg-white rounded-lg p-6 shadow-md">
			<h3 class="text-lg font-semibold mb-4">🎯 System Overview</h3>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				<div class="text-center">
					<div class="text-2xl font-bold text-blue-600">{nexusData.stats?.totalUsers || 0}</div>
					<div class="text-sm text-gray-600">Total Users</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-green-600">{nexusData.stats?.activeUsers || 0}</div>
					<div class="text-sm text-gray-600">Active Users</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-purple-600">{nexusData.dataSources?.length || 0}</div>
					<div class="text-sm text-gray-600">Data Sources</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-orange-600">{nexusData.authProviders?.length || 0}</div>
					<div class="text-sm text-gray-600">Auth Providers</div>
				</div>
			</div>
		</div>
	{/if}
</div>