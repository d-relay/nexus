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

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">📊 Admin Dashboard</h1>
		<p class="mt-2 text-gray-600">Real-time overview of your admin system</p>
	</div>

	{#if loading}
		<div class="animate-pulse space-y-4">
			<div class="grid grid-cols-1 gap-6 md:grid-cols-4">
				{#each Array(4) as _}
					<div class="h-24 rounded-lg bg-gray-200"></div>
				{/each}
			</div>
		</div>
	{:else}
		<!-- Stats Cards -->
		<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
			<div class="overflow-hidden rounded-lg bg-white shadow">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
								<span class="font-semibold text-white">👥</span>
							</div>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="truncate text-sm font-medium text-gray-500">Total Users</dt>
								<dd class="text-lg font-medium text-gray-900">
									{nexusData.stats?.totalUsers || 0}
								</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="overflow-hidden rounded-lg bg-white shadow">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
								<span class="font-semibold text-white">✅</span>
							</div>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="truncate text-sm font-medium text-gray-500">Active Users</dt>
								<dd class="text-lg font-medium text-gray-900">
									{nexusData.stats?.activeUsers || 0}
								</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="overflow-hidden rounded-lg bg-white shadow">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500">
								<span class="font-semibold text-white">💰</span>
							</div>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="truncate text-sm font-medium text-gray-500">Revenue</dt>
								<dd class="text-lg font-medium text-gray-900">
									{nexusData.stats?.revenue || '$0'}
								</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="overflow-hidden rounded-lg bg-white shadow">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
								<span class="font-semibold text-white">📈</span>
							</div>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="truncate text-sm font-medium text-gray-500">Growth</dt>
								<dd class="text-lg font-medium text-gray-900">{nexusData.stats?.growth || '0%'}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Users Table -->
		<div class="mb-8 overflow-hidden bg-white shadow sm:rounded-lg">
			<div class="px-4 py-5 sm:px-6">
				<h3 class="text-lg font-medium leading-6 text-gray-900">User Management</h3>
				<p class="mt-1 max-w-2xl text-sm text-gray-500">Manage users in your system</p>
			</div>
			<div class="border-t border-gray-200">
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>
									User
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>
									Role
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>
									Status
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#each nexusData.users || [] as user}
								<tr>
									<td class="whitespace-nowrap px-6 py-4">
										<div class="flex items-center">
											<div class="h-10 w-10 flex-shrink-0">
												<div
													class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300"
												>
													<span class="font-semibold text-gray-700"
														>{user.name?.[0]?.toUpperCase()}</span
													>
												</div>
											</div>
											<div class="ml-4">
												<div class="text-sm font-medium text-gray-900">{user.name}</div>
												<div class="text-sm text-gray-500">{user.email}</div>
											</div>
										</div>
									</td>
									<td class="whitespace-nowrap px-6 py-4">
										<span
											class="inline-flex rounded-full px-2 py-1 text-xs font-semibold
											{user.role === 'admin'
												? 'bg-purple-100 text-purple-800'
												: user.role === 'moderator'
													? 'bg-blue-100 text-blue-800'
													: 'bg-gray-100 text-gray-800'}"
										>
											{user.role}
										</span>
									</td>
									<td class="whitespace-nowrap px-6 py-4">
										<span
											class="inline-flex rounded-full px-2 py-1 text-xs font-semibold
											{user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}"
										>
											{user.active ? 'Active' : 'Inactive'}
										</span>
									</td>
									<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
										<button class="mr-3 text-indigo-600 hover:text-indigo-900">Edit</button>
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
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<div class="rounded-lg bg-white p-6 shadow">
				<h3 class="mb-4 text-lg font-medium text-gray-900">🗄️ Data Sources</h3>
				<div class="space-y-3">
					{#each nexusData.dataSources || [] as dataSource}
						<div class="flex items-center justify-between rounded-lg bg-gray-50 p-3">
							<span class="font-medium">{dataSource}</span>
							<span
								class="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800"
							>
								Connected
							</span>
						</div>
					{/each}
					{#if !nexusData.dataSources?.length}
						<p class="text-gray-500">No data sources configured</p>
					{/if}
				</div>
			</div>

			<div class="rounded-lg bg-white p-6 shadow">
				<h3 class="mb-4 text-lg font-medium text-gray-900">🔐 Auth Providers</h3>
				<div class="space-y-3">
					{#each nexusData.authProviders || [] as authProvider}
						<div class="flex items-center justify-between rounded-lg bg-gray-50 p-3">
							<span class="font-medium">{authProvider}</span>
							<span
								class="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800"
							>
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
