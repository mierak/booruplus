export declare global {
	interface Window {
		api: {
			send(channel: string, data: unknown): void;
			receive(channel: string, data: Function): void;
		};
	}
}
