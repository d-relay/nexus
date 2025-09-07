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

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-12 text-center">
		<h1 class="mb-4 text-4xl font-bold text-gray-900">🚀 Nexus Admin Framework</h1>
		<p class="mx-auto max-w-2xl text-xl text-gray-600">
			Database & Auth agnostic admin framework built with SvelteKit
		</p>
	</div>

	{#if loading}
		<div class="py-12 text-center">
			<div class="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
			<p class="mt-4 text-gray-600">Initializing Nexus kernel...</p>
		</div>
	{:else if error}
		<div class="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
			{error}
		</div>
	{:else}
		<!-- Hero Section -->
		<div class="mb-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
			<div class="grid items-center gap-8 md:grid-cols-2">
				<div>
					<h2 class="mb-4 text-2xl font-bold">
						{nexusData.config?.app?.name || 'Nexus Admin'}
					</h2>
					<p class="mb-6 text-blue-100">
						Version {nexusData.config?.app?.version || '1.0.0'} •
						{nexusData.config?.app?.environment || 'development'}
					</p>
					<div class="flex gap-4">
						<a
							href="/dashboard"
							class="rounded-lg bg-white px-6 py-2 font-semibold text-blue-600 transition-colors hover:bg-gray-100"
						>
							View Dashboard
						</a>
						<a
							href="/plugins"
							class="rounded-lg border border-white px-6 py-2 font-semibold transition-colors hover:bg-white hover:text-blue-600"
						>
							Manage Plugins
						</a>
					</div>
				</div>
				<div class="space-y-4">
					<div class="rounded-lg bg-white bg-opacity-20 p-4">
						<h3 class="mb-2 font-semibold">🗄️ Data Sources</h3>
						<p class="text-blue-100">{nexusData.dataSources?.length || 0} configured</p>
					</div>
					<div class="rounded-lg bg-white bg-opacity-20 p-4">
						<h3 class="mb-2 font-semibold">🔐 Auth Providers</h3>
						<p class="text-blue-100">{nexusData.authProviders?.length || 0} configured</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Features Grid -->
		<div class="mb-8 grid gap-6 md:grid-cols-3">
			<div class="rounded-lg bg-white p-6 shadow-md">
				<div class="mb-4 flex items-center">
					<div class="rounded-lg bg-blue-100 p-3">
						<span class="text-2xl">🔌</span>
					</div>
					<h3 class="ml-4 text-lg font-semibold">Plugin Architecture</h3>
				</div>
				<p class="text-gray-600">
					Extensible plugin system allows you to add any database, authentication provider, or UI
					component.
				</p>
			</div>

			<div class="rounded-lg bg-white p-6 shadow-md">
				<div class="mb-4 flex items-center">
					<div class="rounded-lg bg-green-100 p-3">
						<span class="text-2xl">🗄️</span>
					</div>
					<h3 class="ml-4 text-lg font-semibold">Database Agnostic</h3>
				</div>
				<p class="text-gray-600">
					Choose PostgreSQL, MongoDB, MySQL, or any database. No vendor lock-in, ever.
				</p>
			</div>

			<div class="rounded-lg bg-white p-6 shadow-md">
				<div class="mb-4 flex items-center">
					<div class="rounded-lg bg-purple-100 p-3">
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
		<div class="rounded-lg bg-white p-6 shadow-md">
			<h3 class="mb-4 text-lg font-semibold">🎯 System Overview</h3>
			<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
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
					<div class="text-2xl font-bold text-orange-600">
						{nexusData.authProviders?.length || 0}
					</div>
					<div class="text-sm text-gray-600">Auth Providers</div>
				</div>
			</div>
		</div>
	{/if}
</div>
