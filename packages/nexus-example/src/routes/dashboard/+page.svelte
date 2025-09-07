<script lang="ts">
	import { onMount } from 'svelte';
	import { initializeNexus, getNexusData } from '$lib/nexus';

	let nexusData: any = {};
	let loading = true;

	onMount(async () => {
		await initializeNexus();
		nexusData = getNexusData();
		loading = false;
	});
</script>

<svelte:head>
	<title>Dashboard - Nexus Admin</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">📊 Admin Dashboard</h1>
		<p class="text-gray-600 mt-2">Real-time overview of your admin system</p>
	</div>

	{#if loading}
		<div class="animate-pulse space-y-4">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
				{#each Array(4) as _}
					<div class="bg-gray-200 h-24 rounded-lg"></div>
				{/each}
			</div>
		</div>
	{:else}
		<!-- Stats Cards -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
								<span class="text-white font-semibold">👥</span>
							</div>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Total Users</dt>
								<dd class="text-lg font-medium text-gray-900">{nexusData.stats?.totalUsers || 0}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
								<span class="text-white font-semibold">✅</span>
							</div>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Active Users</dt>
								<dd class="text-lg font-medium text-gray-900">{nexusData.stats?.activeUsers || 0}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
								<span class="text-white font-semibold">💰</span>
							</div>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Revenue</dt>
								<dd class="text-lg font-medium text-gray-900">{nexusData.stats?.revenue || '$0'}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
								<span class="text-white font-semibold">📈</span>
							</div>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Growth</dt>
								<dd class="text-lg font-medium text-gray-900">{nexusData.stats?.growth || '0%'}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Users Table -->
		<div class="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
			<div class="px-4 py-5 sm:px-6">
				<h3 class="text-lg leading-6 font-medium text-gray-900">User Management</h3>
				<p class="mt-1 max-w-2xl text-sm text-gray-500">Manage users in your system</p>
			</div>
			<div class="border-t border-gray-200">
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									User
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Role
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each nexusData.users || [] as user}
								<tr>
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="flex items-center">
											<div class="flex-shrink-0 h-10 w-10">
												<div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
													<span class="font-semibold text-gray-700">{user.name?.[0]?.toUpperCase()}</span>
												</div>
											</div>
											<div class="ml-4">
												<div class="text-sm font-medium text-gray-900">{user.name}</div>
												<div class="text-sm text-gray-500">{user.email}</div>
											</div>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full 
											{user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
											 user.role === 'moderator' ? 'bg-blue-100 text-blue-800' : 
											 'bg-gray-100 text-gray-800'}">
											{user.role}
										</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full 
											{user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
											{user.active ? 'Active' : 'Inactive'}
										</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										<button class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
										<button class="text-red-600 hover:text-red-900">Delete</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- System Info -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="bg-white shadow rounded-lg p-6">
				<h3 class="text-lg font-medium text-gray-900 mb-4">🗄️ Data Sources</h3>
				<div class="space-y-3">
					{#each nexusData.dataSources || [] as dataSource}
						<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
							<span class="font-medium">{dataSource}</span>
							<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
								Connected
							</span>
						</div>
					{/each}
					{#if !nexusData.dataSources?.length}
						<p class="text-gray-500">No data sources configured</p>
					{/if}
				</div>
			</div>

			<div class="bg-white shadow rounded-lg p-6">
				<h3 class="text-lg font-medium text-gray-900 mb-4">🔐 Auth Providers</h3>
				<div class="space-y-3">
					{#each nexusData.authProviders || [] as authProvider}
						<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
							<span class="font-medium">{authProvider}</span>
							<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
								Active
							</span>
						</div>
					{/each}
					{#if !nexusData.authProviders?.length}
						<p class="text-gray-500">No auth providers configured</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>