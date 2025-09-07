export class DIContainer {
	private services = new Map<string, any>();
	private instances = new Map<string, any>();

	registerSingleton<T>(token: string, instance: T): void {
		this.instances.set(token, instance);
	}

	registerService<T>(token: string, factory: () => T): void {
		this.services.set(token, factory);
	}

	resolve<T>(token: string): T {
		if (this.instances.has(token)) {
			return this.instances.get(token) as T;
		}

		if (this.services.has(token)) {
			const factory = this.services.get(token);
			const instance = factory();
			this.instances.set(token, instance);
			return instance as T;
		}

		throw new Error(`Service '${token}' not found in container`);
	}

	has(token: string): boolean {
		return this.instances.has(token) || this.services.has(token);
	}
}
