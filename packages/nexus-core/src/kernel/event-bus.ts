type EventHandler = (data?: unknown) => void;

export class EventBus {
	private events = new Map<string, Set<EventHandler>>();

	emit(event: string, data?: unknown): void {
		const handlers = this.events.get(event);
		if (handlers) {
			handlers.forEach((handler) => handler(data));
		}
	}

	on(event: string, handler: EventHandler): () => void {
		if (!this.events.has(event)) {
			this.events.set(event, new Set());
		}
		this.events.get(event)!.add(handler);

		// Return unsubscribe function
		return () => this.off(event, handler);
	}

	off(event: string, handler?: EventHandler): void {
		if (!handler) {
			this.events.delete(event);
		} else {
			const handlers = this.events.get(event);
			if (handlers) {
				handlers.delete(handler);
				if (handlers.size === 0) {
					this.events.delete(event);
				}
			}
		}
	}

	once(event: string, handler: EventHandler): void {
		const wrappedHandler = (data?: unknown) => {
			handler(data);
			this.off(event, wrappedHandler);
		};
		this.on(event, wrappedHandler);
	}
}
