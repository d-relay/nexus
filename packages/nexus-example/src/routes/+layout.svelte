<script>
	import '../app.css';
</script>

<div class="min-h-screen bg-gray-50">
	<nav class="bg-white shadow-sm border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex items-center">
					<h1 class="text-xl font-semibold">🚀 Nexus Admin</h1>
				</div>
				<div class="flex items-center space-x-4">
					<a href="/" class="text-gray-700 hover:text-gray-900">Home</a>
					<a href="/dashboard" class="text-gray-700 hover:text-gray-900">Dashboard</a>
					<a href="/plugins" class="text-gray-700 hover:text-gray-900">Plugins</a>
					<a href="/config" class="text-gray-700 hover:text-gray-900">Config</a>
				</div>
			</div>
		</div>
	</nav>
	
	<main>
		<slot />
	</main>
</div>